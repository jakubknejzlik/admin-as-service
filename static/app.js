"use strict";

var CONFIG = window.CONFIG;
var BASE_URL = CONFIG.url;

var modules = ["ng-admin"];

if (CONFIG.oauth) {
  modules.push("ng-admin.jwt-auth");
}

var myApp = angular.module("myApp", modules);

if (CONFIG.oauth && CONFIG.oauth.flow == "resourceOwnerPasswordCredentials") {
  myApp.config([
    "ngAdminJWTAuthConfiguratorProvider",
    function(ngAdminJWTAuthConfigurator) {
      ngAdminJWTAuthConfigurator.setJWTAuthURL(
        CONFIG.oauth.authorizeUrl || `${BASE_URL}/authorize`
      );
      ngAdminJWTAuthConfigurator.setCustomAuthHeader({
        name: "Authorization",
        template: "Bearer {{token}}"
      });
    }
  ]);
} else if (CONFIG.oauth) {
  console.error(
    "unkown oauth flow type",
    CONFIG.oauth ? CONFIG.oauth.flow : "none"
  );
}

myApp.config([
  "NgAdminConfigurationProvider",
  "RestangularProvider",
  function(NgAdminConfigurationProvider, RestangularProvider) {
    var nga = NgAdminConfigurationProvider;

    RestangularProvider.addFullRequestInterceptor(function(
      element,
      operation,
      what,
      url,
      headers,
      params
    ) {
      if (params._page) {
        params.offset = (params._page - 1) * params._perPage;
        params.limit = params._perPage;
      }
      delete params._page;
      delete params._perPage;

      if (params._sortField) {
        params.order =
          (params._sortDir == "ASC" ? "" : "-") + params._sortField;
        delete params._sortField;
        delete params._sortDir;
      }
      return { params: params };
    });

    RestangularProvider.addResponseInterceptor(function(
      data,
      operation,
      what,
      url,
      response
    ) {
      if (operation == "getList") {
        var contentRange = response.headers("Content-Range");
        response.totalCount = contentRange ? contentRange.split("/")[1] : 0;
      }
      return data;
    });

    var admin = nga.application(CONFIG.title).baseApiUrl(`${BASE_URL}/`);

    var entities = {};
    var entityNames = Object.keys(CONFIG.entities);
    entityNames.forEach(function(entityName) {
      var entity = nga.entity(entityName);
      entity.updateMethod("patch");
      entities[entityName] = entity;
      admin.addEntity(entity);
    });

    entityNames.forEach(function(entityName) {
      var entity = entities[entityName];
      var entityConfig = CONFIG.entities[entityName];

      entity
        .label(entityConfig.name)
        .listView()
        .fields(
          getFields(entityConfig, "list").map(function(field) {
            return getField(nga, field, entities);
          })
        )
        .listActions(["edit", "delete"]);

      entity.creationView().fields(
        getFields(entityConfig, "create").map(function(field) {
          return getField(nga, field, entities);
        })
      );

      entity.editionView().fields(
        getFields(entityConfig, "edit").map(function(field) {
          return getField(nga, field, entities);
        })
      );
    });

    if (CONFIG.oauth) {
      admin.header(
        '<div ng-controller="HeaderCtrl"><div class="navbar-header" ng-controller="HeaderCtrl"> <button type="button" class="navbar-toggle" ng-click="isCollapsed = !isCollapsed"> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </button> <a class="navbar-brand" href="#" ng-click="appController.displayHome()">{{title}}</a> </div> <ul class="nav navbar-top-links navbar-right hidden-xs"> <li uib-dropdown> <a uib-dropdown-toggle href="#" aria-expanded="true"> <i class="fa fa-user fa-lg"></i>&nbsp;{{username}}&nbsp;<i class="fa fa-caret-down"></i> </a> <ul class="dropdown-menu dropdown-user" role="menu"> <li><a href="#/logout"><i class="fa fa-sign-out fa-fw"></i> Logout</a></li> </ul> </li> </ul></div>'
      );
    }

    nga.configure(admin);
  }
]);

myApp.controller("HeaderCtrl", [
  "$scope",
  "$location",
  function($scope, $location) {
    $scope.username = "Me";
    $scope.title = CONFIG.title;
  }
]);

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
    default:
      result = nga.field(field.attribute || field.name, field.type);
  }

  if (field.label) {
    result.label(field.label);
  }

  return result;
}
