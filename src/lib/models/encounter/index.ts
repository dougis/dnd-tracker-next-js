import mongoose from 'mongoose';
import { IEncounter, EncounterModel, IParticipantReference } from './interfaces';
import { encounterSchema } from './schemas';
import { validateParticipantHP } from './utils';
import * as methods from './methods';
import * as statics from './statics';

// Virtual properties
encounterSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

encounterSchema.virtual('playerCount').get(function() {
  return this.participants.filter((p: IParticipantReference) => p.isPlayer).length;
});

encounterSchema.virtual('isActive').get(function() {
  return this.combatState.isActive;
});

encounterSchema.virtual('currentParticipant').get(function() {
  if (!this.combatState.isActive || this.combatState.initiativeOrder.length === 0) {
    return null;
  }

  const currentEntry = this.combatState.initiativeOrder[this.combatState.currentTurn];
  if (!currentEntry) return null;

  return this.participants.find((p: IParticipantReference) =>
    p.characterId.toString() === currentEntry.participantId.toString()
  ) || null;
});

// Instance methods
encounterSchema.methods.addParticipant = methods.addParticipant;
encounterSchema.methods.removeParticipant = methods.removeParticipant;
encounterSchema.methods.updateParticipant = methods.updateParticipant;
encounterSchema.methods.getParticipant = methods.getParticipant;
encounterSchema.methods.startCombat = methods.startCombat;
encounterSchema.methods.endCombat = methods.endCombat;
encounterSchema.methods.nextTurn = methods.nextTurn;
encounterSchema.methods.previousTurn = methods.previousTurn;
encounterSchema.methods.setInitiative = methods.setInitiative;
encounterSchema.methods.applyDamage = methods.applyDamage;
encounterSchema.methods.applyHealing = methods.applyHealing;
encounterSchema.methods.addCondition = methods.addCondition;
encounterSchema.methods.removeCondition = methods.removeCondition;
encounterSchema.methods.getInitiativeOrder = methods.getInitiativeOrder;
encounterSchema.methods.calculateDifficulty = methods.calculateDifficulty;
encounterSchema.methods.duplicateEncounter = methods.duplicateEncounter;
encounterSchema.methods.toSummary = methods.toSummary;

// Static methods
encounterSchema.statics.findByOwnerId = statics.findByOwnerId;
encounterSchema.statics.findByStatus = statics.findByStatus;
encounterSchema.statics.findPublic = statics.findPublic;
encounterSchema.statics.searchByName = statics.searchByName;
encounterSchema.statics.findByDifficulty = statics.findByDifficulty;
encounterSchema.statics.findByTargetLevel = statics.findByTargetLevel;
encounterSchema.statics.findActive = statics.findActive;
encounterSchema.statics.createEncounter = statics.createEncounter;

// Pre-save middleware
encounterSchema.pre('save', function(next) {
  // Validate participant HP bounds
  this.participants.forEach((participant: IParticipantReference) => {
    validateParticipantHP(participant);
  });

  // Increment version on updates (except for new documents)
  if (!this.isNew) {
    this.version += 1;
  }

  next();
});

// Post-save middleware
encounterSchema.post('save', function(doc, next) {
  console.log(`Encounter saved: ${doc.name} (ID: ${doc._id})`);
  next();
});

// Create and export the model
export const Encounter = mongoose.model<IEncounter, EncounterModel>('Encounter', encounterSchema);

// Re-export interfaces for convenience
export * from './interfaces';