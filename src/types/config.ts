export interface Forum {
  id: string;
  identifier: string;
  specificContext: string;
  isValid?: boolean;
  validationError?: string | null;
  isValidating?: boolean;
}

export interface StoredForum {
  id: number;
  identifier: string;
  specific_context: string;
}
