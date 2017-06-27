"use strict";

var BASE_URL = "http://api.golfdecisions.knejzlik.cz";

var CONFIG = window.CONFIG;

var myApp = angular.module("myApp", ["ng-admin", "ng-admin.jwt-auth"]);
myApp.config([
  "NgAdminConfigurationProvider",
  "ngAdminJWTAuthConfiguratorProvider",
  "RestangularProvider",
  function(
    NgAdminConfigurationProvider,
    ngAdminJWTAuthConfigurator,
    RestangularProvider
  ) {
    var nga = NgAdminConfigurationProvider;

    ngAdminJWTAuthConfigurator.setJWTAuthURL(`${BASE_URL}/Users/login`);
    ngAdminJWTAuthConfigurator.setCustomAuthHeader({
      name: "Authorization",
      template: "{{token}}"
    });

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

      if (entityConfig.list && entityConfig.list.fields) {
        entity
          .listView()
          .fields(
            entityConfig.list.fields.map(function(field) {
              return nga.field(field.name, field.type);
            })
          )
          .listActions(["edit", "delete"]);
      }

      if (entityConfig.create && entityConfig.create.fields) {
        entity.creationView().fields(
          entityConfig.create.fields.map(function(field) {
            return nga.field(field.name, field.type);
          })
        );
      }

      if (entityConfig.edit && entityConfig.edit.fields) {
        entity.editionView().fields(
          entityConfig.edit.fields.map(function(field) {
            return nga.field(field.name, field.type);
          })
        );
      }

      // entity
      //   .listView()
      //   .fields([nga.field("title")])
      //   .listActions(["edit", "delete"]);
      // Decision.creationView().fields([
      //   nga.field("title").validation({ required: true }),
      //   nga.field("text", "text")
      // ]);
      // Decision.editionView().fields(Decision.creationView().fields());
    });

    admin.header(
      '<div ng-controller="HeaderCtrl"><div class="navbar-header" ng-controller="HeaderCtrl"> <button type="button" class="navbar-toggle" ng-click="isCollapsed = !isCollapsed"> <span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span> </button> <a class="navbar-brand" href="#" ng-click="appController.displayHome()">{{title}}</a> </div> <ul class="nav navbar-top-links navbar-right hidden-xs"> <li uib-dropdown> <a uib-dropdown-toggle href="#" aria-expanded="true"> <i class="fa fa-user fa-lg"></i>&nbsp;{{username}}&nbsp;<i class="fa fa-caret-down"></i> </a> <ul class="dropdown-menu dropdown-user" role="menu"> <li><a href="#/logout"><i class="fa fa-sign-out fa-fw"></i> Logout</a></li> </ul> </li> </ul></div>'
    );

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
