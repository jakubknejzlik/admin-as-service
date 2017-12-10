function createAdmin(nga, config) {
  var admin = nga.application(config.title);

  var entities = {};
  var entityNames = Object.keys(config.entities);
  entityNames.forEach(function(entityName) {
    var entity = nga.entity(entityName);
    var entityConfig = config.entities[entityName];
    entity.updateMethod("patch");

    if (entityConfig.endpoint) {
      entity.url(entityConfig.endpoint);
    }
    if (entityConfig.readonly) {
      entity.readOnly();
    }
    if (entityConfig.identifier) {
      entity.identifier(nga.field(entityConfig.identifier));
    }

    entities[entityName] = entity;

    admin.addEntity(entity);
  });

  entityNames.forEach(function(entityName) {
    var entity = entities[entityName];
    var entityConfig = config.entities[entityName];

    entity.label(entityConfig.name);
    var listView = entity
      .listView()
      .title(
        (entityConfig.list && entityConfig.list.title) || entityConfig.name
      )
      .fields(
        getFields(entityConfig, "list").map(function(field) {
          return getField(nga, field, entities);
        })
      )
      .listActions(getListActions(entityConfig, "list"))
      .actions(getActions(entityConfig, "list"));

    if (entityConfig.list && entityConfig.list.filters) {
      var filters = [];
      for (var key in entityConfig.list.filters) {
        var filterField = entityConfig.list.filters[key];
        filterField.attribute = key;
        filters.push(getField(nga, filterField, entities));
      }
      listView.filters(filters);
    }

    entity
      .creationView()
      .title(
        (entityConfig.create && entityConfig.create.title) || entityConfig.name
      )
      .fields(
        getFields(entityConfig, "create").map(function(field) {
          return getField(nga, field, entities);
        })
      )
      .onSubmitSuccess(function() {
        window.history.back();
        return false;
      })
      .actions(getActions(entityConfig, "create"));

    entity
      .editionView()
      .title(
        (entityConfig.edit && entityConfig.edit.title) || entityConfig.name
      )
      .fields(
        getFields(entityConfig, "edit").map(function(field) {
          return getField(nga, field, entities);
        })
      )
      .onSubmitSuccess(function() {
        window.history.back();
        return false;
      })
      .actions(getActions(entityConfig, "edit"));
  });

  var menu = nga.menu();
  for (var key in entities) {
    var entity = entities[key];
    var entityConfig = config.entities[key];
    if (!entityConfig.hidden) {
      menu.addChild(nga.menu(entity));
    }
  }
  admin.menu(menu);

  return admin;
}

function getFields(entity, type) {
  if (entity[type] && entity[type].fields) {
    return entity[type].fields;
  }
  return entity.fields || [];
}

function getListActions(entity, type) {
  return _getActions(entity, type, "listActions", "xs", ["edit", "delete"]);
}

function getActions(entity, type) {
  return _getActions(entity, type, "actions", "md", null);
}

function _getActions(entity, type, subType, size, defaultValue) {
  var actions = defaultValue;
  if (entity[type] && entity[type][subType]) {
    actions = entity[type][subType];
  } else if (entity[subType]) {
    actions = entity[subType];
  }

  if (actions === null) {
    return null;
  }

  actions = actions.map(function(action) {
    if (typeof action === "string") {
      return action;
    }
    var style = action.style || "default";
    var icon = action.icon;

    var button = "<ma-" + action.action + "-button ";
    button += 'entry="entry" size="' + size + '" ';
    for (var key in action) {
      button +=
        inflection.dasherize(inflection.dasherize(key)) +
        '="' +
        action[key] +
        '" ';
    }
    button += "></ma-" + action.action + "-button>";
    return button;
  });

  return actions;
}

function getField(nga, field, entities) {
  var result = null;
  switch (field.type) {
    case "reference":
      result = nga
        .field(
          field.attribute || field.name,
          field.toMany ? "reference_many" : "reference"
        )
        .targetEntity(entities[field.entity])
        .targetField(nga.field(field.targetField));
      break;
    case "select":
      result = nga
        .field(field.attribute || field.name, "choices")
        .choices(field.options);
      break;
    case "choice":
      result = nga
        .field(field.attribute || field.name, "choice")
        .choices(field.options);
      break;

    case "choices":
      result = nga
        .field(field.attribute || field.name, "choices")
        .choices(field.options);
      break;
    default:
      result = nga.field(field.attribute || field.name, field.type);
      if (field.format) {
        result.format(field.format);
      }
  }

  if (field.label) result.label(field.label);

  if (field.pinned) result.pinned(field.pinned);
  if (field.attributes) result.attributes(field.attributes);
  if (field.validation) result.validation(field.validation);
  if (field.readonly) result.editable(false);

  return result;
}
