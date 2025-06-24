// Base Modal Components
export { Modal, modalVariants } from './Modal';
export type { ModalProps, VariantProps } from './Modal';

// Confirmation Dialog
export {
  ConfirmationDialog,
  useConfirmationDialog,
} from './ConfirmationDialog';
export type { ConfirmationDialogProps } from './ConfirmationDialog';

// Info Modal
export {
  InfoModal,
  CharacterInfoModal,
  EncounterInfoModal,
  CombatInfoModal,
  InfoSection,
  InfoField,
} from './InfoModal';
export type { InfoModalProps, InfoModalType } from './InfoModal';

// Form Modal
export {
  FormModal,
  useFormModal,
  QuickAddModal,
  QuickEditModal,
} from './FormModal';
export type { FormModalProps, QuickFormModalProps } from './FormModal';

// Modal Manager
export {
  ModalManager,
  useModalManager,
  useModal,
  useModalInstance,
} from './ModalManager';
export type { ModalConfig, ModalManagerProps } from './ModalManager';
