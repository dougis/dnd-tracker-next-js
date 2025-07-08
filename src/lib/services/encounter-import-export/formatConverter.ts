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
 * Parse XML data to JavaScript object
 */
export function parseXmlToData(xmlString: string): any {
  // Simple XML parser - in production, use a proper XML parsing library
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');

  const parseXmlNode = (node: Element): any => {
    if (node.children.length === 0) {
      const text = node.textContent || '';

      // Try to parse as number
      if (/^\d+$/.test(text)) {
        return parseInt(text, 10);
      }
      if (/^\d+\.\d+$/.test(text)) {
        return parseFloat(text);
      }

      // Try to parse as boolean
      if (text === 'true') return true;
      if (text === 'false') return false;

      return text;
    }

    const result: any = {};

    for (const child of Array.from(node.children)) {
      const key = child.tagName;
      const value = parseXmlNode(child);

      if (result[key]) {
        if (!Array.isArray(result[key])) {
          result[key] = [result[key]];
        }
        result[key].push(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  };

  return parseXmlNode(xmlDoc.documentElement);
}