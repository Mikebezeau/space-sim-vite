import EditorMechBP from "../classes/mechBP/EditorMechBP";

export const getZoom = (editorMechBP: EditorMechBP) => {
  return editorMechBP.size() * -1.5;
};
