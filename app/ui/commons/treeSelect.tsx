"use client";

export type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};
