function createAdmin(nga, config) {
  var admin = nga.application(config.title);

  var entities = {};
  var entityNames = Object.keys(config.entities);
  entityNames.forEach(function(entityName) {
    var entity = nga.entity(entityName);
    entity.updateMethod("patch");
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
      .listActions(["edit", "delete"]);

    if (entityConfig.list && entityConfig.list.filters) {
      var filters = [];
      for (var key in entityConfig.list.filters) {
        var filter = entityConfig.list.filters[key];
        filters.push(nga.field(key).label(filter.label).pinned(filter.pinned));
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
      );

    entity
      .editionView()
      .title(
        (entityConfig.edit && entityConfig.edit.title) || entityConfig.name
      )
      .fields(
        getFields(entityConfig, "edit").map(function(field) {
          return getField(nga, field, entities);
        })
      );
  });

  return admin;
}

function getFields(entity, type) {
  if (entity[type] && entity[type].fields) {
    return entity[type].fields;
  }
  return entity.fields || [];
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
    default:
      result = nga.field(field.attribute || field.name, field.type);
  }

  if (field.label) {
    result.label(field.label);
  }

  return result;
}
