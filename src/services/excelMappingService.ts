import { CollectionReport } from '@/types/banking';

// Interface pour le résultat de détection du type de collection
interface CollectionTypeResult {
  type: 'EFFET' | 'CHEQUE' | 'UNKNOWN';
  effetEcheanceDate: Date | null;
  chequeNumber: string | null;
  rawValue?: string;
}

class ExcelMappingService {
  // Détecte le type de collection (EFFET ou CHEQUE) basé sur la valeur de No.CHq /Bd
  detectCollectionType(noChqBdValue: any): CollectionTypeResult {
    if (!noChqBdValue || noChqBdValue === null) {
      return {
        type: 'UNKNOWN',
        effetEcheanceDate: null,
        chequeNumber: null
      };
    }
    
    // Détection : DATE = EFFET
    if (this.isDate(noChqBdValue)) {
      return {
        type: 'EFFET',
        effetEcheanceDate: this.parseDate(noChqBdValue),
        chequeNumber: null,
        rawValue: String(noChqBdValue)
      };
    }
    
    // Détection : NUMÉRO = CHÈQUE
    if (this.isNumber(noChqBdValue)) {
      return {
        type: 'CHEQUE',
        effetEcheanceDate: null,
        chequeNumber: String(noChqBdValue),
        rawValue: String(noChqBdValue)
      };
    }
    
    // Cas ambigus
    return {
      type: 'UNKNOWN',
      effetEcheanceDate: null,
      chequeNumber: null,
      rawValue: String(noChqBdValue)
    };
  }
  
  private isDate(value: any): boolean {
    // Vérification si c'est un objet Date
    if (value instanceof Date) return true;
    
    // Vérification si c'est une string de date
    if (typeof value === 'string') {
      const dateRegex = /^\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}/;
      return dateRegex.test(value);
    }
    
    return false;
  }
  
  private isNumber(value: any): boolean {
    // Vérification si c'est un nombre
    if (typeof value === 'number' && !isNaN(value)) return true;
    
    // Vérification si c'est une string numérique
    if (typeof value === 'string') {
      const numericRegex = /^\d+$/;
      return numericRegex.test(value);
    }
    
    return false;
  }
  
  private parseDate(value: any): Date | null {
    try {
      if (!value) return null;
      
      let date: Date;
      const trimmedValue = String(value).trim();
      
      if (typeof trimmedValue === 'string') {
        // Format français (DD/MM/YYYY ou DD-MM-YYYY)
        const frenchDateRegex = /^(\d{2})[/-](\d{2})[/-](\d{2,4})$/;
        const match = trimmedValue.match(frenchDateRegex);
        
        if (match) {
          const [, day, month, year] = match;
          let fullYear = parseInt(year);
          if (fullYear < 100) {
            // Gérer les années à 2 chiffres (25 -> 2025, 95 -> 1995)
            fullYear += fullYear < 50 ? 2000 : 1900;
          }
          
          const isoDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          console.log(`📅 Date française détectée: ${trimmedValue} -> ${isoDate}`);
          
          const parsed = new Date(isoDate);
          if (!isNaN(parsed.getTime())) {
            date = parsed;
          } else {
            throw new Error(`Date française invalide après conversion: ${isoDate}`);
          }
        } else {
          // Essayer le parsing standard pour les autres formats
          const parsed = new Date(trimmedValue);
          if (isNaN(parsed.getTime())) {
            console.warn('⚠️ Date invalide, utilisation de la date du jour:', trimmedValue);
            return new Date().toISOString().split('T')[0];
          }
          date = parsed;
        }
      } else {
        console.warn('⚠️ Format de date non reconnu, utilisation de la date du jour:', value);
        return new Date().toISOString().split('T')[0];
      }
      
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.warn('⚠️ Erreur parsing date, utilisation de la date du jour:', value, error);
      return new Date().toISOString().split('T')[0];
    }
  }
  
  private parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    
    try {
      if (typeof value === 'number') {
        // ⭐ ARRONDIR automatiquement pour éviter les erreurs bigint
        return isNaN(value) ? undefined : Math.round(value);
      }
      
      if (typeof value === 'string') {
        // Nettoyer la chaîne (espaces, virgules comme séparateurs de milliers)
        const cleaned = value.replace(/[\s,]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        // ⭐ ARRONDIR automatiquement
        return isNaN(parsed) ? undefined : Math.round(parsed);
      }
      
      return undefined;
    } catch (error) {
      console.warn('⚠️ Erreur parsing nombre (non-bloquant):', value, error);
      return undefined;
    }
  }
  
  private parseString(value: any): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    
    const str = String(value).trim();
    return str === '' ? undefined : str;
  }
}

export const excelMappingService = new ExcelMappingService();