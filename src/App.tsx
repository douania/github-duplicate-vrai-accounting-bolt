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
      return numericRegex.test(value.trim());
    }
    
    return false;
  }

  mapExcelRowToCollection(row: any): CollectionReport {
    console.log('🔄 MAPPING avec tolérance aux erreurs:', {
      client: row.clientCode,
      filename: row.excel_filename,
      sourceRow: row.excel_source_row
    });
    
    // Détection du type de collection (EFFET ou CHEQUE)
    const noChqBdValue = row.noChqBd;
    const typeResult = this.detectCollectionType(noChqBdValue);
    
    // ⭐ MODE TOLÉRANT - Traçabilité optionnelle
    const collection: CollectionReport = {
      reportDate: this.parseDate(row.reportDate) || new Date().toISOString().split('T')[0], // Date par défaut si parsing échoue
      clientCode: this.parseString(row.clientCode) || 'UNKNOWN',
      collectionAmount: this.parseNumber(row.collectionAmount) || 0,
      bankName: this.parseString(row.bankName),
      status: 'pending',
      
      // Logique métier effet/chèque
      collectionType: typeResult.type,
      effetEcheanceDate: typeResult.effetEcheanceDate ? typeResult.effetEcheanceDate.toISOString().split('T')[0] : undefined,
      effetStatus: typeResult.type === 'EFFET' ? 'PENDING' : undefined,
      chequeNumber: typeResult.chequeNumber,
      chequeStatus: typeResult.type === 'CHEQUE' ? 'PENDING' : undefined,
      
      // ⭐ TRAÇABILITÉ OPTIONNELLE - Ne plus bloquer le traitement
      excelFilename: row.excel_filename || 'UNKNOWN_FILE',
      excelSourceRow: row.excel_source_row || 0,
      excelProcessedAt: new Date().toISOString(),
      
      // Champs optionnels
      dateOfValidity: this.parseDate(row.dateOfValidity),
      factureNo: this.parseString(row.factureNo),
      noChqBd: this.parseString(row.noChqBd),
      bankNameDisplay: this.parseString(row.bankNameDisplay),
      depoRef: this.parseString(row.depoRef),
      nj: this.parseNumber(row.nj),
      taux: this.parseNumber(row.taux),
      interet: this.parseNumber(row.interet),
      commission: this.parseNumber(row.commission),
      tob: this.parseNumber(row.tob),
      fraisEscompte: this.parseNumber(row.fraisEscompte),
      bankCommission: this.parseNumber(row.bankCommission),
      sgOrFaNo: this.parseString(row.sgOrFaNo),
      dNAmount: this.parseNumber(row.dNAmount),
      income: this.parseNumber(row.income),
      dateOfImpay: this.parseDate(row.dateOfImpay),
      reglementImpaye: this.parseString(row.reglementImpaye),
      remarques: this.parseString(row.remarques),
      
      processingStatus: 'NEW'
    };
    
    // ⭐ AVERTISSEMENT au lieu d'erreur bloquante
    if (!collection.excelFilename || !collection.excelSourceRow) {
      console.warn('⚠️ TRAÇABILITÉ MANQUANTE (non-bloquant):', {
        client: collection.clientCode,
        filename: collection.excelFilename,
        row: collection.excelSourceRow
      });
    }
    
    console.log('✅ Collection mappée (mode tolérant):', {
      client: collection.clientCode,
      filename: collection.excelFilename,
      row: collection.excelSourceRow
    });
    
    return collection;
  }
  
  private parseDate(value: any): string | undefined {
    if (!value) return undefined;
    
    // Si c'est déjà un objet Date
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // Si c'est une string, essayer de la parser
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return undefined;
      
      // Essayer de créer une date
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    
    return undefined;
  }
  
  private parseString(value: any): string | undefined {
    if (!value) return undefined;
    const str = String(value).trim();
    return str === '' ? undefined : str;
  }
  
  private parseNumber(value: any): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
}

export const excelMappingService = new ExcelMappingService();