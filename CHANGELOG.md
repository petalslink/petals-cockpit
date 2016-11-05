<a name="0.2.0"></a>
# 0.2.0 (2016-11-04)


### Features

* add workspaces creation/retrieval ([b20bb6a](https://gitlab.com/victornoel/petals-cockpit/commit/b20bb6a) [3c901a9](https://gitlab.com/victornoel/petals-cockpit/commit/3c901a9))
* display bus import status (pending|failed) and let the user review/cancel if an error occurred ([7a6d5ac](https://gitlab.com/victornoel/petals-cockpit/commit/7a6d5ac))
*  import a bus within a given workspace ([fc3f07d](https://gitlab.com/victornoel/petals-cockpit/commit/fc3f07d) [85bf46c](https://gitlab.com/victornoel/petals-cockpit/commit/85bf46c))
* **backend:** retrieve bus info from Petals container ([34b6f3f](https://gitlab.com/victornoel/petals-cockpit/commit/34b6f3f))
* **backend:** switch to spring-security-crypto ([894b83c](https://gitlab.com/victornoel/petals-cockpit/commit/894b83c))
* **frontend**: settings as full page ([408ad6f](https://gitlab.com/victornoel/petals-cockpit/commit/408ad6f))

### Performance Improvements

* **backend:** Add index for username in db ([13a2c48](https://gitlab.com/victornoel/petals-cockpit/commit/13a2c48))



<a name="0.1.0"></a>
# 0.1.0 (2016-10-13)


### Features

* Add basic petals content view ([037d663](https://gitlab.com/victornoel/petals-cockpit/commit/037d663))
* Add basic service and api content view ([9014ac9](https://gitlab.com/victornoel/petals-cockpit/commit/9014ac9))
* Create ServiceUnitMenuComponent to display a SU in the menu ([cac71b7](https://gitlab.com/victornoel/petals-cockpit/commit/cac71b7)), closes [#60](https://gitlab.com/victornoel/petals-cockpit/issues/60)
* Display user's first name once logged ([b491450](https://gitlab.com/victornoel/petals-cockpit/commit/b491450))
* Handle click and routing on buses/containers/components/SUs ([0043630](https://gitlab.com/victornoel/petals-cockpit/commit/0043630)), closes [#79](https://gitlab.com/victornoel/petals-cockpit/issues/79) [#80](https://gitlab.com/victornoel/petals-cockpit/issues/80) [#81](https://gitlab.com/victornoel/petals-cockpit/issues/81) [#82](https://gitlab.com/victornoel/petals-cockpit/issues/82)
* Handle user login/logout + handle errors + ng serve proxy ([a39b239](https://gitlab.com/victornoel/petals-cockpit/commit/a39b239))
* Load/reload buses if the workspace ID changes ([b8e43f9](https://gitlab.com/victornoel/petals-cockpit/commit/b8e43f9)), closes [#83](https://gitlab.com/victornoel/petals-cockpit/issues/83)
* Petals search ([2849b7e](https://gitlab.com/victornoel/petals-cockpit/commit/2849b7e))
* Redirect user to /cockpit/workspaces if already logged and trying to access /login ([d8a4927](https://gitlab.com/victornoel/petals-cockpit/commit/d8a4927)), closes [#45](https://gitlab.com/victornoel/petals-cockpit/issues/45)
* Setup basic route for login and petals-cockpit ([d679b17](https://gitlab.com/victornoel/petals-cockpit/commit/d679b17)), closes [#24](https://gitlab.com/victornoel/petals-cockpit/issues/24) [#25](https://gitlab.com/victornoel/petals-cockpit/issues/25) [#26](https://gitlab.com/victornoel/petals-cockpit/issues/26)
* Setup environment variable to use mocked services (or not) ([fcbb9f9](https://gitlab.com/victornoel/petals-cockpit/commit/fcbb9f9))
* User login add username and password to the form and pass it to the server ([9840135](https://gitlab.com/victornoel/petals-cockpit/commit/9840135)), closes [#35](https://gitlab.com/victornoel/petals-cockpit/issues/35)

