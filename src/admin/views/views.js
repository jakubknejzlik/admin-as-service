import { createListView } from "./views.list";
import { createChangeView, createAddView } from "./views.detail";

export const createViews = (entities, connectorFactory) => {
  let result = {};
  for (let key in entities) {
    let entity = entities[key];
    result[key] = createView(entity, connectorFactory);
  }
  return result;
};

const createView = (entity, connectorFactory) => {
  let listView = createListView(entity, connectorFactory);
  let changeView = createChangeView(entity, connectorFactory);
  let addView = createAddView(entity, connectorFactory);

  return { listView, changeView, addView };
};
