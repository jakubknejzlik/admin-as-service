import { createListView } from "./views.list";
import { createChangeView, createAddView } from "./views.detail";

export const createViews = entities => {
  let result = {};
  for (let key in entities) {
    let entity = entities[key];
    if (!entity.hidden) {
      result[key] = createView(entity);
    }
  }
  return result;
};

const createView = entity => {
  let listView = createListView(entity);
  let changeView = createChangeView(entity);
  let addView = createAddView(entity);

  return { listView, changeView, addView };
};
