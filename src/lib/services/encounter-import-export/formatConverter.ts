/**
 * Format conversion utilities for encounter import/export
 */

import { XMLParser } from 'fast-xml-parser';
import type { EncounterExportData } from './types';

/**
 * Escape special XML characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build XML element recursively
 */
function buildXmlElement(name: string, value: any, indent: string = ''): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    return buildObjectXmlElement(name, value, indent);
  }

  if (Array.isArray(value)) {
    return buildArrayXmlElement(name, value, indent);
  }

  if (typeof value === 'string') {
    return `${indent}<${name}>${escapeXml(value)}</${name}>`;
  }

  return `${indent}<${name}>${value}</${name}>`;
}

/**
 * Build XML element for object values
 */
function buildObjectXmlElement(name: string, value: object, indent: string): string {
  const children = Object.entries(value)
    .map(([key, val]) => buildXmlElement(key, val, indent + '  '))
    .filter(Boolean)
    .join('\n');
  return `${indent}<${name}>\n${children}\n${indent}</${name}>`;
}

/**
 * Build XML element for array values
 */
function buildArrayXmlElement(name: string, value: any[], indent: string): string {
  const items = value
    .map((item, _index) => buildXmlElement(name.slice(0, -1) || 'item', item, indent + '  '))
    .join('\n');
  return `${indent}<${name}>\n${items}\n${indent}</${name}>`;
}

/**
 * Convert export data to XML format
 */
export function convertToXml(data: EncounterExportData): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXmlElement('encounterExport', data)}`;
}


/**
 * Parse XML data to JavaScript object using fast-xml-parser
 */
export function parseXmlToData(xmlString: string): any {
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: false,
    trimValues: true,
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