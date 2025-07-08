/**
 * Format conversion utilities for encounter import/export
 */

import type { EncounterExportData } from './types';

/**
 * Convert export data to XML format
 */
export function convertToXml(data: EncounterExportData): string {
  const escapeXml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const buildXmlElement = (name: string, value: any, indent: string = ''): string => {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      const children = Object.entries(value)
        .map(([key, val]) => buildXmlElement(key, val, indent + '  '))
        .filter(Boolean)
        .join('\n');
      return `${indent}<${name}>\n${children}\n${indent}</${name}>`;
    }

    if (Array.isArray(value)) {
      const items = value
        .map((item, _index) => buildXmlElement(name.slice(0, -1) || 'item', item, indent + '  '))
        .join('\n');
      return `${indent}<${name}>\n${items}\n${indent}</${name}>`;
    }

    if (typeof value === 'string') {
      return `${indent}<${name}>${escapeXml(value)}</${name}>`;
    }

    return `${indent}<${name}>${value}</${name}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXmlElement('encounterExport', data)}`;
}


/**
 * Parse XML data to JavaScript object using fast-xml-parser
 */
export function parseXmlToData(xmlString: string): any {
  const { XMLParser } = require('fast-xml-parser');

  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: false,
    trimValues: true,
    parseTrueNumberOnly: false,
    parseTagValue: false,
  });

  try {
    const jsonObj = parser.parse(xmlString);
    return jsonObj;
  } catch (error) {
    console.error('XML parsing error:', error);
    throw new Error('Failed to parse XML data');
  }
}