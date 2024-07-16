import { create } from "zustand";
import generateItems from "./utils/generateItems";

const useMainUIStore = create((set, get) => {
  return {
    selectedItem: 0,
    allItems: [
      ...generateItems(9, "private"),
      ...generateItems(3, "share"),
      ...generateItems(3, "sam"),
    ],
    getAllItems: () => get().allItems,
    setAllItems: (allItems) => {
      set({ allItems });
    },
    playLike: () => {},
    playMenuChange: () => {},
    playMenuAction: () => {},
    playMenuValidate: () => {},
    playMail: () => {},
    playRingtone: () => {},
    initSound: (sounds) => set(sounds),
    isThreeLoaded: false,

    setIsThreeLoaded: (value) => set({ isThreeLoaded: value }),

    isPrivateLocker: () =>
      get().allItems[get().selectedItem].category === "private",
    isShareLocker: () =>
      get().allItems[get().selectedItem].category === "share",
    isSamCargo: () => get().allItems[get().selectedItem].category === "sam",
    itemsPrivateLocker: () =>
      get().allItems.filter(
        (item) => item.category === "private" && item.likes >= 0
      ),
    itemsShareLocker: () =>
      get().allItems.filter(
        (item) => item.category === "share" && item.likes >= 0
      ),
    itemsSam: () =>
      get().allItems.filter(
        (item) => item.category === "sam" && item.likes >= 0
      ),
    allItemsSorted: () => [
      ...get().itemsPrivateLocker,
      ...get().itemsShareLocker,
      ...get().itemsSam,
    ],
    selectedId: () => get().allItems[get().selectedItem].id,
    selectedCategory: () => get().allItems[get().selectedItem].category,
    totalWeight: () => {
      return get()
        .itemsSam()
        .reduce((acc, value) => acc + value.weight, 0);
    },
  };
});

export default useMainUIStore;
