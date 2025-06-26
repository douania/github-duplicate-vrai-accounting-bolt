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
  }
}

export const excelMappingService = new ExcelMappingService();