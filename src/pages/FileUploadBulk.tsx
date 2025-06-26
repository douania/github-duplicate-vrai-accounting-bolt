import React from 'react';
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
      if (typeof noChqBdValue === 'number') {
        // ⭐ ARRONDIR automatiquement pour éviter les erreurs bigint
        return {
          type: 'EFFET',
          effetEcheanceDate: new Date(noChqBdValue),
          chequeNumber: null,
          rawValue: noChqBdValue.toString()
        };
      }
      
      if (typeof noChqBdValue === 'string') {
        // Nettoyer la chaîne (espaces, virgules comme séparateurs de milliers)
        const cleaned = noChqBdValue.replace(/[\s,]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        
        if (!isNaN(parsed)) {
          return {
            type: 'EFFET',
            effetEcheanceDate: new Date(parsed),
            chequeNumber: null,
            rawValue: noChqBdValue
          };
        } else {
          return {
            type: 'CHEQUE',
            effetEcheanceDate: null,
            chequeNumber: noChqBdValue,
            rawValue: noChqBdValue
          };
        }
      }
      
      return {
        type: 'UNKNOWN',
        effetEcheanceDate: null,
        chequeNumber: null
      };
    } catch (error) {
      console.warn('⚠️ Erreur parsing nombre (non-bloquant):', noChqBdValue, error);
      return {
        type: 'UNKNOWN',
        effetEcheanceDate: null,
        chequeNumber: null
      };
    }
  }
}

export const excelMappingService = new ExcelMappingService();

// React component with default export
const FileUploadBulk: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Bulk File Upload</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Bulk file upload functionality will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default FileUploadBulk;