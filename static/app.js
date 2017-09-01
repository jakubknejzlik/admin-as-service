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

      if (operation == "getList") {
        if (params._filters) {
          for (var filter in params._filters) {
            params[filter] = params._filters[filter];
          }
          delete params._filters;
        }

        var fieldNames = [];
        var fields = getFields(CONFIG.entities[what], "edit");
        fields.forEach(function(field) {
          fieldNames.push(field.attribute);
        });
        params.fields = fieldNames.join(",");
      }

      if (operation == "patch") {
        var newElement = {};
        var fields = getFields(CONFIG.entities[what], "edit");
        fields.forEach(function(field) {
          newElement[field.attribute] = element[field.attribute];
        });
        element = newElement;
      }

      return { params: params, element: element };
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

    var admin = createAdmin(nga, CONFIG);

    admin.baseApiUrl(`${BASE_URL}/`);

    var logoutDropdown = CONFIG.oauth
      ? `<ul class="nav navbar-top-links navbar-right" style="float: right;"> <li uib-dropdown> <a uib-dropdown-toggle href="#" aria-expanded="true"> <i class="fa fa-user fa-lg"></i>&nbsp;{{username}}&nbsp;<i class="fa fa-caret-down"></i> </a> <ul class="dropdown-menu dropdown-user" role="menu"> <li><a href="#/logout"><i class="fa fa-sign-out fa-fw"></i> Logout</a></li> </ul> </li> </ul>`
      : "";

    admin.header(
      `<div class="navbar-header" style="float: none">
            <button type="button" class="navbar-toggle" ng-click="isCollapsed = !isCollapsed">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>` +
        logoutDropdown +
        `<a href="#" ng-click="appController.displayHome()" class="navbar-brand">{{ ::appController.applicationName }}</a>
        </div>`
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
