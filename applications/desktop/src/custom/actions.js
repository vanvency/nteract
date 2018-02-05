export const CHANGE_TAB = "CHANGE_TAB";
export const CLOSE_TAB = "CLOSE_TAB";

export function changeTabAction(key) {
  return {
    type: CHANGE_TAB,
    key: key
  };
}

export function closeTabAction(key) {
  return {
    type: CLOSE_TAB,
    key: key
  };
}
