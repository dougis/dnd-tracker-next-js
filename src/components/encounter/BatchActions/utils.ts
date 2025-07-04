export const getEncounterText = (count: number): string => 
  `${count} encounter${count !== 1 ? 's' : ''}`;

export const createBatchOperation = (action: string, selectedCount: number) => ({
  action,
  target: getEncounterText(selectedCount),
  message: `${action} ${selectedCount} encounters`,
});