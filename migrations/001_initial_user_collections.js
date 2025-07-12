/**
 * Migration: Create initial user collections and indexes
 * Version: 001
 * Created: 2025-01-12T00:00:00.000Z
 */

/**
 * Helper function to execute multiple promises with proper error handling
 */
function executeIndexOperations(operations) {
  var Promise = require('bluebird') || global.Promise;
  return Promise.all(operations);
}

/**
 * Helper function to create index operations for a collection
 */
function createCollectionIndexes(db, collectionName, indexes) {
  var collection = db.collection(collectionName);
  var operations = indexes.map(function(indexSpec) {
    return collection.createIndex(indexSpec.keys, indexSpec.options || {});
  });
  return executeIndexOperations(operations);
}

/**
 * Helper function to drop index operations for a collection
 */
function dropCollectionIndexes(db, collectionName, indexes) {
  var collection = db.collection(collectionName);
  var operations = indexes.map(function(indexSpec) {
    return collection.dropIndex(indexSpec.keys);
  });
  return executeIndexOperations(operations);
}

module.exports = {
  version: '001',
  description: 'Create initial user collections and indexes',

  /**
   * Apply migration
   * @param db - The MongoDB database instance
   */
  up: function(db) {
    var Promise = require('bluebird') || global.Promise;
    
    return new Promise(function(resolve, reject) {
      // User collection indexes
      var userIndexes = [
        { keys: { email: 1 }, options: { unique: true } },
        { keys: { username: 1 }, options: { unique: true } },
        { keys: { createdAt: 1 } },
        { keys: { updatedAt: 1 } }
      ];

      createCollectionIndexes(db, 'users', userIndexes).then(function() {
        // Account collection indexes
        var accountIndexes = [
          { keys: { provider: 1, providerAccountId: 1 }, options: { unique: true } },
          { keys: { userId: 1 } }
        ];
        return createCollectionIndexes(db, 'accounts', accountIndexes);
      }).then(function() {
        // Session collection indexes
        var sessionIndexes = [
          { keys: { sessionToken: 1 }, options: { unique: true } },
          { keys: { userId: 1 } },
          { keys: { expires: 1 } }
        ];
        return createCollectionIndexes(db, 'sessions', sessionIndexes);
      }).then(function() {
        // Verification token collection indexes
        var tokenIndexes = [
          { keys: { identifier: 1, token: 1 }, options: { unique: true } },
          { keys: { expires: 1 } }
        ];
        return createCollectionIndexes(db, 'verification_tokens', tokenIndexes);
      }).then(function() {
        resolve();
        return true;
      }).catch(function(error) {
        reject(error);
      });
    });
  },

  /**
   * Rollback migration
   * @param db - The MongoDB database instance
   */
  down: function(db) {
    var Promise = require('bluebird') || global.Promise;
    
    return new Promise(function(resolve, reject) {
      // User collection indexes to drop
      var userIndexes = [
        { keys: { email: 1 } },
        { keys: { username: 1 } },
        { keys: { createdAt: 1 } },
        { keys: { updatedAt: 1 } }
      ];

      dropCollectionIndexes(db, 'users', userIndexes).then(function() {
        // Account collection indexes to drop
        var accountIndexes = [
          { keys: { provider: 1, providerAccountId: 1 } },
          { keys: { userId: 1 } }
        ];
        return dropCollectionIndexes(db, 'accounts', accountIndexes);
      }).then(function() {
        // Session collection indexes to drop
        var sessionIndexes = [
          { keys: { sessionToken: 1 } },
          { keys: { userId: 1 } },
          { keys: { expires: 1 } }
        ];
        return dropCollectionIndexes(db, 'sessions', sessionIndexes);
      }).then(function() {
        // Verification token collection indexes to drop
        var tokenIndexes = [
          { keys: { identifier: 1, token: 1 } },
          { keys: { expires: 1 } }
        ];
        return dropCollectionIndexes(db, 'verification_tokens', tokenIndexes);
      }).then(function() {
        resolve();
        return true;
      }).catch(function(error) {
        reject(error);
      });
    });
  }
};