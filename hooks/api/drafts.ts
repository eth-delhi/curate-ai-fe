import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

export interface CreateDraftDto {
  title?: string;
  content?: string;
  uuid?: string;
}

export interface DraftResponseDto {
  uuid: string;
  title?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Save or update a draft
 */
export const saveDraft = async (
  data: CreateDraftDto
): Promise<DraftResponseDto> => {
  const res = await API.put("/posts/drafts", data);
  return res.data;
};

export const useSaveDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveDraft,
    onSuccess: () => {
      // Invalidate drafts query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["drafts"] });
    },
  });
};

/**
 * Get all drafts for the current user
 */
export const getDrafts = async (): Promise<DraftResponseDto[]> => {
  const res = await API.get("/posts/drafts");
  return res.data;
};

export const useGetDrafts = () => {
  return useQuery({
    queryKey: ["drafts"],
    queryFn: getDrafts,
  });
};

/**
 * Get a single draft by UUID
 * This finds the draft from the list
 */
export const getDraftByUuid = async (
  uuid: string
): Promise<DraftResponseDto | null> => {
  const drafts = await getDrafts();
  return drafts.find((draft) => draft.uuid === uuid) || null;
};

export const useGetDraft = (uuid: string | null) => {
  return useQuery({
    queryKey: ["draft", uuid],
    queryFn: () => getDraftByUuid(uuid!),
    enabled: !!uuid,
  });
};
