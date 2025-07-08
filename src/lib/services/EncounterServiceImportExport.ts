import type { IEncounter } from '@/lib/models/encounter/interfaces';
import type { ServiceResult } from './UserServiceErrors';
import {
  handleEncounterServiceError,
  InvalidEncounterIdError
} from './EncounterServiceErrors';
import { Character } from '@/lib/models/Character';
import { Encounter } from '@/lib/models/encounter';
import { z } from 'zod';
import { Types } from 'mongoose';

/**
 * Export formats supported by the import/export system
 */
export type ExportFormat = 'json' | 'xml';

/**
 * Export options for customizing export behavior
 */
export interface ExportOptions {
  includeCharacterSheets?: boolean;
  includePrivateNotes?: boolean;
  includeIds?: boolean;
  stripPersonalData?: boolean;
}

/**
 * Import options for customizing import behavior
 */
export interface ImportOptions {
  ownerId: string;
  preserveIds?: boolean;
  createMissingCharacters?: boolean;
  overwriteExisting?: boolean;
}

/**
 * Comprehensive encounter export data structure
 */
export interface EncounterExportData {
  metadata: {
    exportedAt: string;
    exportedBy: string;
    format: ExportFormat;
    version: string;
    appVersion: string;
  };
  encounter: {
    name: string;
    description: string;
    tags: string[];
    difficulty?: 'trivial' | 'easy' | 'medium' | 'hard' | 'deadly';
    estimatedDuration?: number;
    targetLevel?: number;
    status: 'draft' | 'active' | 'completed' | 'archived';
    isPublic: boolean;
    settings: {
      allowPlayerVisibility: boolean;
      autoRollInitiative: boolean;
      trackResources: boolean;
      enableLairActions: boolean;
      lairActionInitiative?: number;
      enableGridMovement: boolean;
      gridSize: number;
      roundTimeLimit?: number;
      experienceThreshold?: number;
    };
    combatState?: {
      isActive: boolean;
      currentRound: number;
      currentTurn: number;
      totalDuration: number;
      startedAt?: string;
      pausedAt?: string;
      endedAt?: string;
      initiativeOrder: Array<{
        participantId: string;
        initiative: number;
        dexterity: number;
        isActive: boolean;
        hasActed: boolean;
        isDelayed?: boolean;
        readyAction?: string;
      }>;
    };
    participants: Array<{
      id: string;
      name: string;
      type: 'pc' | 'npc' | 'monster';
      maxHitPoints: number;
      currentHitPoints: number;
      temporaryHitPoints: number;
      armorClass: number;
      initiative?: number;
      isPlayer: boolean;
      isVisible: boolean;
      notes: string;
      conditions: string[];
      position?: { x: number; y: number };
    }>;
    characterSheets?: Array<{
      id: string;
      name: string;
      type: 'pc' | 'npc';
      race: string;
      customRace?: string;
      size: 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';
      classes: Array<{
        class: string;
        level: number;
        subclass?: string;
        hitDie: number;
      }>;
      abilityScores: {
        strength: number;
        dexterity: number;
        constitution: number;
        intelligence: number;
        wisdom: number;
        charisma: number;
      };
      hitPoints: {
        maximum: number;
        current: number;
        temporary: number;
      };
      armorClass: number;
      speed: number;
      proficiencyBonus: number;
      savingThrows: {
        strength: boolean;
        dexterity: boolean;
        constitution: boolean;
        intelligence: boolean;
        wisdom: boolean;
        charisma: boolean;
      };
      skills: Record<string, boolean>;
      equipment: Array<{
        name: string;
        quantity: number;
        weight: number;
        value: number;
        description?: string;
        equipped: boolean;
        magical: boolean;
      }>;
      spells: Array<{
        name: string;
        level: number;
        school: string;
        castingTime: string;
        range: string;
        components: string;
        duration: string;
        description: string;
        isPrepared: boolean;
      }>;
      backstory: string;
      notes: string;
      imageUrl?: string;
    }>;
  };
}

/**
 * Schema for validating encounter export data
 */
const encounterExportSchema = z.object({
  metadata: z.object({
    exportedAt: z.string(),
    exportedBy: z.string(),
    format: z.enum(['json', 'xml']),
    version: z.string(),
    appVersion: z.string(),
  }),
  encounter: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000),
    tags: z.array(z.string().max(30)).max(10),
    difficulty: z.enum(['trivial', 'easy', 'medium', 'hard', 'deadly']).optional(),
    estimatedDuration: z.number().min(1).max(480).optional(),
    targetLevel: z.number().min(1).max(20).optional(),
    status: z.enum(['draft', 'active', 'completed', 'archived']),
    isPublic: z.boolean(),
    settings: z.object({
      allowPlayerVisibility: z.boolean(),
      autoRollInitiative: z.boolean(),
      trackResources: z.boolean(),
      enableLairActions: z.boolean(),
      lairActionInitiative: z.number().min(1).max(30).optional(),
      enableGridMovement: z.boolean(),
      gridSize: z.number().min(1).max(50),
      roundTimeLimit: z.number().min(30).max(600).optional(),
      experienceThreshold: z.number().min(0).max(30).optional(),
    }),
    combatState: z.object({
      isActive: z.boolean(),
      currentRound: z.number().min(0),
      currentTurn: z.number().min(0),
      totalDuration: z.number().min(0),
      startedAt: z.string().optional(),
      pausedAt: z.string().optional(),
      endedAt: z.string().optional(),
      initiativeOrder: z.array(z.object({
        participantId: z.string(),
        initiative: z.number().min(1).max(30),
        dexterity: z.number().min(1).max(30),
        isActive: z.boolean(),
        hasActed: z.boolean(),
        isDelayed: z.boolean().optional(),
        readyAction: z.string().optional(),
      })),
    }).optional(),
    participants: z.array(z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      type: z.enum(['pc', 'npc', 'monster']),
      maxHitPoints: z.number().min(1).max(999),
      currentHitPoints: z.number().min(-999).max(999),
      temporaryHitPoints: z.number().min(0).max(999),
      armorClass: z.number().min(1).max(30),
      initiative: z.number().min(1).max(30).optional(),
      isPlayer: z.boolean(),
      isVisible: z.boolean(),
      notes: z.string().max(500),
      conditions: z.array(z.string().max(50)).max(20),
      position: z.object({
        x: z.number().min(0),
        y: z.number().min(0),
      }).optional(),
    })).max(50),
    characterSheets: z.array(z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      type: z.enum(['pc', 'npc']),
      race: z.string().min(1).max(50),
      customRace: z.string().max(50).optional(),
      size: z.enum(['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan']),
      classes: z.array(z.object({
        class: z.string().min(1).max(50),
        level: z.number().min(1).max(20),
        subclass: z.string().max(50).optional(),
        hitDie: z.number().min(4).max(12),
      })).min(1).max(5),
      abilityScores: z.object({
        strength: z.number().min(1).max(30),
        dexterity: z.number().min(1).max(30),
        constitution: z.number().min(1).max(30),
        intelligence: z.number().min(1).max(30),
        wisdom: z.number().min(1).max(30),
        charisma: z.number().min(1).max(30),
      }),
      hitPoints: z.object({
        maximum: z.number().min(1).max(999),
        current: z.number().min(-999).max(999),
        temporary: z.number().min(0).max(999),
      }),
      armorClass: z.number().min(1).max(30),
      speed: z.number().min(0).max(200),
      proficiencyBonus: z.number().min(2).max(6),
      savingThrows: z.object({
        strength: z.boolean(),
        dexterity: z.boolean(),
        constitution: z.boolean(),
        intelligence: z.boolean(),
        wisdom: z.boolean(),
        charisma: z.boolean(),
      }),
      skills: z.record(z.string(), z.boolean()),
      equipment: z.array(z.object({
        name: z.string().min(1).max(100),
        quantity: z.number().min(0).max(999),
        weight: z.number().min(0).max(999),
        value: z.number().min(0).max(999999),
        description: z.string().max(500).optional(),
        equipped: z.boolean(),
        magical: z.boolean(),
      })).max(200),
      spells: z.array(z.object({
        name: z.string().min(1).max(100),
        level: z.number().min(0).max(9),
        school: z.string().min(1).max(50),
        castingTime: z.string().min(1).max(100),
        range: z.string().min(1).max(100),
        components: z.string().min(1).max(100),
        duration: z.string().min(1).max(100),
        description: z.string().min(1).max(2000),
        isPrepared: z.boolean(),
      })).max(500),
      backstory: z.string().max(10000),
      notes: z.string().max(2000),
      imageUrl: z.string().url().optional(),
    })).optional(),
  }),
});

/**
 * Encounter Import/Export Service
 *
 * Provides functionality for exporting encounters to various formats
 * and importing encounters from external sources.
 */
export class EncounterServiceImportExport {
  private static readonly EXPORT_VERSION = '1.0.0';

  private static readonly APP_VERSION = '1.0.0';

  /**
   * Export encounter to JSON format
   */
  static async exportToJson(
    encounterId: string,
    userId: string,
    options: ExportOptions = {}
  ): Promise<ServiceResult<string>> {
    try {
      const exportData = await this.prepareExportData(encounterId, userId, 'json', options);
      if (!exportData.success) {
        return {
          success: false,
          error: exportData.error,
        };
      }

      const jsonString = JSON.stringify(exportData.data, null, 2);
      return {
        success: true,
        data: jsonString,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to export encounter to JSON',
        'ENCOUNTER_EXPORT_JSON_FAILED'
      );
    }
  }

  /**
   * Export encounter to XML format
   */
  static async exportToXml(
    encounterId: string,
    userId: string,
    options: ExportOptions = {}
  ): Promise<ServiceResult<string>> {
    try {
      const exportData = await this.prepareExportData(encounterId, userId, 'xml', options);
      if (!exportData.success) {
        return {
          success: false,
          error: exportData.error,
        };
      }

      const xmlString = this.convertToXml(exportData.data!);
      return {
        success: true,
        data: xmlString,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to export encounter to XML',
        'ENCOUNTER_EXPORT_XML_FAILED'
      );
    }
  }

  /**
   * Import encounter from JSON format
   */
  static async importFromJson(
    jsonData: string,
    options: ImportOptions
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const parsedData = JSON.parse(jsonData);
      const validationResult = encounterExportSchema.safeParse(parsedData);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: 'Invalid JSON format',
            details: validationResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
            code: 'INVALID_IMPORT_FORMAT',
            statusCode: 400,
          },
        };
      }

      return await this.processImportData(validationResult.data, options);
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to import encounter from JSON',
        'ENCOUNTER_IMPORT_JSON_FAILED'
      );
    }
  }

  /**
   * Import encounter from XML format
   */
  static async importFromXml(
    xmlData: string,
    options: ImportOptions
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const parsedData = this.parseXmlToData(xmlData);
      const validationResult = encounterExportSchema.safeParse(parsedData);

      if (!validationResult.success) {
        return {
          success: false,
          error: {
            message: 'Invalid XML format',
            details: validationResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
            code: 'INVALID_IMPORT_FORMAT',
            statusCode: 400,
          },
        };
      }

      return await this.processImportData(validationResult.data, options);
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to import encounter from XML',
        'ENCOUNTER_IMPORT_XML_FAILED'
      );
    }
  }

  /**
   * Generate shareable encounter link
   */
  static async generateShareableLink(
    encounterId: string,
    userId: string,
    expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<ServiceResult<string>> {
    try {
      if (!Types.ObjectId.isValid(encounterId)) {
        throw new InvalidEncounterIdError(encounterId);
      }

      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        return {
          success: false,
          error: {
            message: 'Encounter not found',
            code: 'ENCOUNTER_NOT_FOUND',
            statusCode: 404,
          },
        };
      }

      // Check if user has permission to share
      if (encounter.ownerId.toString() !== userId && !encounter.sharedWith.includes(new Types.ObjectId(userId))) {
        return {
          success: false,
          error: {
            message: 'You do not have permission to share this encounter',
            code: 'INSUFFICIENT_PERMISSIONS',
            statusCode: 403,
          },
        };
      }

      // Generate sharing token and URL
      const shareToken = this.generateShareToken(encounterId, userId, expiresIn);
      const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/encounters/shared/${shareToken}`;

      return {
        success: true,
        data: shareUrl,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to generate shareable link',
        'ENCOUNTER_SHARE_LINK_FAILED'
      );
    }
  }

  /**
   * Create encounter template for reuse
   */
  static async createTemplate(
    encounterId: string,
    userId: string,
    templateName: string
  ): Promise<ServiceResult<EncounterExportData>> {
    try {
      const exportOptions: ExportOptions = {
        includeCharacterSheets: false,
        includePrivateNotes: false,
        includeIds: false,
        stripPersonalData: true,
      };

      const exportData = await this.prepareExportData(encounterId, userId, 'json', exportOptions);
      if (!exportData.success) {
        return exportData;
      }

      const templateData = exportData.data!;
      templateData.encounter.name = templateName;
      templateData.encounter.description = `Template created from: ${templateData.encounter.name}`;
      templateData.encounter.status = 'draft';
      templateData.encounter.isPublic = false;

      // Clear combat state for templates
      templateData.encounter.combatState = {
        isActive: false,
        currentRound: 0,
        currentTurn: 0,
        totalDuration: 0,
        initiativeOrder: [],
      };

      // Reset participant combat data
      templateData.encounter.participants = templateData.encounter.participants.map(p => ({
        ...p,
        currentHitPoints: p.maxHitPoints,
        temporaryHitPoints: 0,
        initiative: undefined,
        conditions: [],
        notes: '',
      }));

      return {
        success: true,
        data: templateData,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to create encounter template',
        'ENCOUNTER_TEMPLATE_CREATION_FAILED'
      );
    }
  }

  /**
   * Prepare export data with all encounter information
   */
  private static async prepareExportData(
    encounterId: string,
    userId: string,
    format: ExportFormat,
    options: ExportOptions
  ): Promise<ServiceResult<EncounterExportData>> {
    try {
      if (!Types.ObjectId.isValid(encounterId)) {
        throw new InvalidEncounterIdError(encounterId);
      }

      const encounter = await Encounter.findById(encounterId);
      if (!encounter) {
        return {
          success: false,
          error: {
            message: 'Encounter not found',
            code: 'ENCOUNTER_NOT_FOUND',
            statusCode: 404,
          },
        };
      }

      // Check permissions
      if (encounter.ownerId.toString() !== userId && !encounter.sharedWith.includes(new Types.ObjectId(userId))) {
        return {
          success: false,
          error: {
            message: 'You do not have permission to export this encounter',
            code: 'INSUFFICIENT_PERMISSIONS',
            statusCode: 403,
          },
        };
      }

      // Prepare export data
      const exportData: EncounterExportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: userId,
          format,
          version: this.EXPORT_VERSION,
          appVersion: this.APP_VERSION,
        },
        encounter: {
          name: encounter.name,
          description: encounter.description,
          tags: encounter.tags,
          difficulty: encounter.difficulty,
          estimatedDuration: encounter.estimatedDuration,
          targetLevel: encounter.targetLevel,
          status: encounter.status,
          isPublic: encounter.isPublic,
          settings: encounter.settings,
          participants: encounter.participants.map(p => ({
            id: options.includeIds ? p.characterId.toString() : this.generateTempId(),
            name: p.name,
            type: p.type,
            maxHitPoints: p.maxHitPoints,
            currentHitPoints: p.currentHitPoints,
            temporaryHitPoints: p.temporaryHitPoints,
            armorClass: p.armorClass,
            initiative: p.initiative,
            isPlayer: p.isPlayer,
            isVisible: p.isVisible,
            notes: options.includePrivateNotes ? p.notes : '',
            conditions: p.conditions,
            position: p.position,
          })),
        },
      };

      // Add combat state if encounter is active
      if (encounter.combatState?.isActive) {
        exportData.encounter.combatState = {
          isActive: encounter.combatState.isActive,
          currentRound: encounter.combatState.currentRound,
          currentTurn: encounter.combatState.currentTurn,
          totalDuration: encounter.combatState.totalDuration,
          startedAt: encounter.combatState.startedAt?.toISOString(),
          pausedAt: encounter.combatState.pausedAt?.toISOString(),
          endedAt: encounter.combatState.endedAt?.toISOString(),
          initiativeOrder: encounter.combatState.initiativeOrder.map(i => ({
            participantId: options.includeIds ? i.participantId.toString() : this.generateTempId(),
            initiative: i.initiative,
            dexterity: i.dexterity,
            isActive: i.isActive,
            hasActed: i.hasActed,
            isDelayed: i.isDelayed,
            readyAction: i.readyAction || undefined,
          })),
        };
      }

      // Include character sheets if requested
      if (options.includeCharacterSheets) {
        const characterIds = encounter.participants.map(p => p.characterId);
        const characters = await Character.find({ _id: { $in: characterIds } });

        exportData.encounter.characterSheets = characters.map(char => ({
          id: options.includeIds ? char._id.toString() : this.generateTempId(),
          name: char.name,
          type: char.type,
          race: char.race,
          customRace: char.customRace,
          size: char.size,
          classes: char.classes,
          abilityScores: char.abilityScores,
          hitPoints: char.hitPoints,
          armorClass: char.armorClass,
          speed: char.speed,
          proficiencyBonus: char.proficiencyBonus,
          savingThrows: char.savingThrows,
          skills: Object.fromEntries(char.skills),
          equipment: char.equipment,
          spells: char.spells,
          backstory: options.stripPersonalData ? '' : char.backstory,
          notes: options.includePrivateNotes && !options.stripPersonalData ? char.notes : '',
          imageUrl: char.imageUrl,
        }));
      }

      return {
        success: true,
        data: exportData,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to prepare export data',
        'ENCOUNTER_EXPORT_DATA_PREPARATION_FAILED'
      );
    }
  }

  /**
   * Process imported encounter data and create encounter
   */
  private static async processImportData(
    importData: z.infer<typeof encounterExportSchema>,
    options: ImportOptions
  ): Promise<ServiceResult<IEncounter>> {
    try {
      const encounterData = importData.encounter;

      // Handle character creation if needed
      const participantMap = new Map<string, Types.ObjectId>();

      if (options.createMissingCharacters && encounterData.characterSheets) {
        for (const charSheet of encounterData.characterSheets) {
          const character = new Character({
            ownerId: new Types.ObjectId(options.ownerId),
            name: charSheet.name,
            type: charSheet.type,
            race: charSheet.race,
            customRace: charSheet.customRace,
            size: charSheet.size,
            classes: charSheet.classes,
            abilityScores: charSheet.abilityScores,
            hitPoints: charSheet.hitPoints,
            armorClass: charSheet.armorClass,
            speed: charSheet.speed,
            proficiencyBonus: charSheet.proficiencyBonus,
            savingThrows: charSheet.savingThrows,
            skills: new Map(Object.entries(charSheet.skills)),
            equipment: charSheet.equipment,
            spells: charSheet.spells,
            backstory: charSheet.backstory,
            notes: charSheet.notes,
            imageUrl: charSheet.imageUrl,
            isPublic: false,
          });

          await character.save();
          participantMap.set(charSheet.id, character._id);
        }
      }

      // Create encounter
      const createEncounterInput = {
        ownerId: options.ownerId,
        name: encounterData.name,
        description: encounterData.description,
        tags: encounterData.tags,
        difficulty: encounterData.difficulty,
        estimatedDuration: encounterData.estimatedDuration,
        targetLevel: encounterData.targetLevel,
        participants: encounterData.participants.map(p => ({
          characterId: participantMap.get(p.id) || new Types.ObjectId(),
          name: p.name,
          type: p.type,
          maxHitPoints: p.maxHitPoints,
          currentHitPoints: p.currentHitPoints,
          temporaryHitPoints: p.temporaryHitPoints,
          armorClass: p.armorClass,
          initiative: p.initiative,
          isPlayer: p.isPlayer,
          isVisible: p.isVisible,
          notes: p.notes,
          conditions: p.conditions,
          position: p.position,
        })),
        settings: encounterData.settings,
        isPublic: encounterData.isPublic,
      };

      const newEncounter = await Encounter.create(createEncounterInput);
      return {
        success: true,
        data: newEncounter,
      };
    } catch (error) {
      return handleEncounterServiceError(
        error,
        'Failed to process import data',
        'ENCOUNTER_IMPORT_DATA_PROCESSING_FAILED'
      );
    }
  }

  /**
   * Convert export data to XML format
   */
  private static convertToXml(data: EncounterExportData): string {
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
  private static parseXmlToData(xmlString: string): any {
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

  /**
   * Generate temporary ID for data without persistent IDs
   */
  private static generateTempId(): string {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate sharing token for encounter links
   */
  private static generateShareToken(encounterId: string, userId: string, expiresIn: number): string {
    const payload = {
      encounterId,
      userId,
      expiresAt: Date.now() + expiresIn,
    };

    // Simple token generation - in production, use JWT or similar
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');
    return token.replace(/[+/=]/g, '').slice(0, 32);
  }
}