export interface ProjectWorkItemComment {
  id:                string;
  workItemId:        string;
  content:           string;
  visibleToSupport:  boolean;
  createdBy:         string | null;
  createdAt:         string;
}

export type CreateProjectWorkItemCommentInput = {
  content:          string;
  visibleToSupport: boolean;
};

export const COMMENT_MAX_LENGTH = 2000;
