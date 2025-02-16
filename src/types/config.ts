
export interface Forum {
  id: string;
  identifier: string;
  specificContext: string;
}

export interface StoredForum {
  id: number;
  identifier: string;
  specific_context: string;
}

export interface ConfigFormData {
  username: string;
  generalContext: string;
  forums: Forum[];
}