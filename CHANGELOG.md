<a name="0.6.0"></a>
# [0.6.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.5.0...v0.6.0) (2017-03-10)


### Bug Fixes

* **product:** make scss work with any base href ([c265f30](https://gitlab.com/linagora/petals-cockpit/commit/c265f30)), closes [#270](https://gitlab.com/linagora/petals-cockpit/issues/270) [#260](https://gitlab.com/linagora/petals-cockpit/issues/260)
* **frontend:** disable discard and import buttons when needed ([b3fa3fb](https://gitlab.com/linagora/petals-cockpit/commit/b3fa3fb))
* **frontend:** Reload on a bus/container/component/su works ([2abcd57](https://gitlab.com/linagora/petals-cockpit/commit/2abcd57)), closes [#244](https://gitlab.com/linagora/petals-cockpit/issues/244)
* **frontend:** tooltips were not disappearing ([6d8b977](https://gitlab.com/linagora/petals-cockpit/commit/6d8b977)), closes [#271](https://gitlab.com/linagora/petals-cockpit/issues/271) [#273](https://gitlab.com/linagora/petals-cockpit/issues/273)
* **frontend:** display containers names in reachabilities ([bd68abd7](https://gitlab.com/linagora/petals-cockpit/commit/bd68abd7)), closes [#246](https://gitlab.com/linagora/petals-cockpit/issues/246)


### Features

* **product:** redirect user to its last workspace after login ([57c1b53](https://gitlab.com/linagora/petals-cockpit/commit/57c1b53)), closes [#108](https://gitlab.com/linagora/petals-cockpit/issues/108)
* **product:** SU and Components lifecycle management, closes [#11](https://gitlab.com/linagora/petals-cockpit/issues/11) [#12](https://gitlab.com/linagora/petals-cockpit/issues/12)
* **product:** Show basic information about workspace ([be08af87](https://gitlab.com/linagora/petals-cockpit/commit/be08af87)) [#267](https://gitlab.com/linagora/petals-cockpit/issues/267)
* **frontend:** add a clear button to the import bus form ([951693e](https://gitlab.com/linagora/petals-cockpit/commit/951693e)), closes [#219](https://gitlab.com/linagora/petals-cockpit/issues/219)
* **frontend:** Close sidenav on click if small screen ([7563a4a](https://gitlab.com/linagora/petals-cockpit/commit/7563a4a)), closes [#249](https://gitlab.com/linagora/petals-cockpit/issues/249)
* **frontend:** Display green led only if workspace is selected ([cfa2c0b](https://gitlab.com/linagora/petals-cockpit/commit/cfa2c0b)), closes [#247](https://gitlab.com/linagora/petals-cockpit/issues/247)
* **frontend:** Show a message when the search bar doesn't yield any result ([44219c31](https://gitlab.com/linagora/petals-cockpit/commit/44219c31)), closes [#228](https://gitlab.com/linagora/petals-cockpit/issues/228)
* **frontend:** Add a warning icon next to failed bus in progress in the side bar ([0321092d](https://gitlab.com/linagora/petals-cockpit/commit/0321092d)), closes [#232](https://gitlab.com/linagora/petals-cockpit/issues/232)
* **frontend:** During search in tree, elements hidden by fold should be made visible via unfold of their parent ([49e59999](https://gitlab.com/linagora/petals-cockpit/commit/49e59999)), closes [#248](https://gitlab.com/linagora/petals-cockpit/issues/248)
* **frontend:** Unreachable containers should be shown too in the container overview ([165b762d](https://gitlab.com/linagora/petals-cockpit/commit/165b762d)), closes [#281](https://gitlab.com/linagora/petals-cockpit/issues/281)
* **frontend:** Show workspaces users in workspaces list ([9334c57f](https://gitlab.com/linagora/petals-cockpit/commit/9334c57f)), closes [#217](https://gitlab.com/linagora/petals-cockpit/issues/217)


### Performance Improvements

* **frontend:** ensure guards are triggered only once ([aa02731](https://gitlab.com/linagora/petals-cockpit/commit/aa02731))



<a name="0.5.0"></a>
# [0.5.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.4.0...v0.5.0) (2017-02-21)


### Features

* **frontend:** desktop application built with Electron ([06b13b9](https://gitlab.com/linagora/petals-cockpit/commit/06b13b9))
* **frontend:** service worker + icon + manifest.json to install on mobiles ([36529eb](https://gitlab.com/linagora/petals-cockpit/commit/36529eb))
* **frontend:** show HTTP error for bus import failure ([219e894](https://gitlab.com/linagora/petals-cockpit/commit/219e894))
* **backend:** only set pac4j clients in configuration ([caf9cf4](https://gitlab.com/linagora/petals-cockpit/commit/caf9cf4))
* **backend:** support most SQL dialect via JOOQ ([d4c2661](https://gitlab.com/linagora/petals-cockpit/commit/d4c2661)), closes [#126](https://gitlab.com/linagora/petals-cockpit/issues/126)
* **product:** let the backend handle index.html base href ([a8ca575](https://gitlab.com/linagora/petals-cockpit/commit/a8ca575))


### Performance Improvements

* **frontend:** do not apply highlighting for empty search ([33a82b9](https://gitlab.com/linagora/petals-cockpit/commit/33a82b9))
* **frontend:** refactor of the frontend around a normalized store ([bbb4ba4](https://gitlab.com/linagora/petals-cockpit/commit/bbb4ba4))



<a name="0.4.0"></a>
# [0.4.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.3.0...v0.4.0) (2016-12-16)


### Bug Fixes

* Bus and container details are loaded only if clicked from the menu ([8415bda](https://gitlab.com/linagora/petals-cockpit/commit/8415bda)), closes [#155](https://gitlab.com/linagora/petals-cockpit/issues/155)
* Importing bus, IP is not shown ([f1a141e](https://gitlab.com/linagora/petals-cockpit/commit/f1a141e)), closes [#156](https://gitlab.com/linagora/petals-cockpit/issues/156)
* **backend:** buses were not found when they just were imported ([25c3726](https://gitlab.com/linagora/petals-cockpit/commit/25c3726))
* **backend:** prevent race condition on bus import ([e34598f](https://gitlab.com/linagora/petals-cockpit/commit/e34598f))


### Features

* Show basic bus information [7503d39](https://gitlab.com/linagora/petals-cockpit/commit/7503d39)), closes [#114](https://gitlab.com/linagora/petals-cockpit/issues/114)
* Show basic container information ([f7a440c](https://gitlab.com/linagora/petals-cockpit/commit/f7a440c)), closes [#147](https://gitlab.com/linagora/petals-cockpit/issues/147)
* Show basic service unit information ([0c6b8bc](https://gitlab.com/linagora/petals-cockpit/commit/0c6b8bc)), closes [#148](https://gitlab.com/linagora/petals-cockpit/issues/148)
* Allow to update Service Unit state ([f318887](https://gitlab.com/linagora/petals-cockpit/commit/f318887), [9d61c56](https://gitlab.com/linagora/petals-cockpit/commit/9d61c56)), closes [#12](https://gitlab.com/linagora/petals-cockpit/issues/12)
* **frontend:** Split bundle by lazy loading login/rest of the app ([ef8905f](https://gitlab.com/linagora/petals-cockpit/commit/ef8905f)), closes [#127](https://gitlab.com/linagora/petals-cockpit/issues/127)
* **product:** Add an easy to use jar to run Cockpit ([9801eb8](https://gitlab.com/linagora/petals-cockpit/commit/9801eb8)), closes [#120](https://gitlab.com/linagora/petals-cockpit/issues/120)



<a name="0.3.0"></a>
# [0.3.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.2.0...v0.3.0) (2016-11-28)


### Features

* Switch to a relational database ([f2ffaf5](https://gitlab.com/linagora/petals-cockpit/commit/f2ffaf5)), closes [#106](https://gitlab.com/linagora/petals-cockpit/issues/106)
* store imported buses and errors in database ([437dc3b](https://gitlab.com/linagora/petals-cockpit/commit/437dc3b)), closes [#113](https://gitlab.com/linagora/petals-cockpit/issues/113)



<a name="0.2.0"></a>
# [0.2.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.1.0...v0.2.0) (2016-11-04)


### Features

* add workspaces creation/retrieval ([b20bb6a](https://gitlab.com/linagora/petals-cockpit/commit/b20bb6a) [3c901a9](https://gitlab.com/linagora/petals-cockpit/commit/3c901a9))
* display bus import status (pending|failed) and let the user review/cancel if an error occurred ([7a6d5ac](https://gitlab.com/linagora/petals-cockpit/commit/7a6d5ac))
*  import a bus within a given workspace ([fc3f07d](https://gitlab.com/linagora/petals-cockpit/commit/fc3f07d) [85bf46c](https://gitlab.com/linagora/petals-cockpit/commit/85bf46c))
* **backend:** retrieve bus info from Petals container ([34b6f3f](https://gitlab.com/linagora/petals-cockpit/commit/34b6f3f))
* **backend:** switch to spring-security-crypto ([894b83c](https://gitlab.com/linagora/petals-cockpit/commit/894b83c))
* **frontend**: settings as full page ([408ad6f](https://gitlab.com/linagora/petals-cockpit/commit/408ad6f))

### Performance Improvements

* **backend:** Add index for username in db ([13a2c48](https://gitlab.com/linagora/petals-cockpit/commit/13a2c48))



<a name="0.1.0"></a>
# 0.1.0 (2016-10-13)


### Features

* Add basic petals content view ([037d663](https://gitlab.com/linagora/petals-cockpit/commit/037d663))
* Add basic service and api content view ([9014ac9](https://gitlab.com/linagora/petals-cockpit/commit/9014ac9))
* Create ServiceUnitMenuComponent to display a SU in the menu ([cac71b7](https://gitlab.com/linagora/petals-cockpit/commit/cac71b7)), closes [#60](https://gitlab.com/linagora/petals-cockpit/issues/60)
* Display user's first name once logged ([b491450](https://gitlab.com/linagora/petals-cockpit/commit/b491450))
* Handle click and routing on buses/containers/components/SUs ([0043630](https://gitlab.com/linagora/petals-cockpit/commit/0043630)), closes [#79](https://gitlab.com/linagora/petals-cockpit/issues/79) [#80](https://gitlab.com/linagora/petals-cockpit/issues/80) [#81](https://gitlab.com/linagora/petals-cockpit/issues/81) [#82](https://gitlab.com/linagora/petals-cockpit/issues/82)
* Handle user login/logout + handle errors + ng serve proxy ([a39b239](https://gitlab.com/linagora/petals-cockpit/commit/a39b239))
* Load/reload buses if the workspace ID changes ([b8e43f9](https://gitlab.com/linagora/petals-cockpit/commit/b8e43f9)), closes [#83](https://gitlab.com/linagora/petals-cockpit/issues/83)
* Petals search ([2849b7e](https://gitlab.com/linagora/petals-cockpit/commit/2849b7e))
* Redirect user to /cockpit/workspaces if already logged and trying to access /login ([d8a4927](https://gitlab.com/linagora/petals-cockpit/commit/d8a4927)), closes [#45](https://gitlab.com/linagora/petals-cockpit/issues/45)
* Setup basic route for login and petals-cockpit ([d679b17](https://gitlab.com/linagora/petals-cockpit/commit/d679b17)), closes [#24](https://gitlab.com/linagora/petals-cockpit/issues/24) [#25](https://gitlab.com/linagora/petals-cockpit/issues/25) [#26](https://gitlab.com/linagora/petals-cockpit/issues/26)
* Setup environment variable to use mocked services (or not) ([fcbb9f9](https://gitlab.com/linagora/petals-cockpit/commit/fcbb9f9))
* User login add username and password to the form and pass it to the server ([9840135](https://gitlab.com/linagora/petals-cockpit/commit/9840135)), closes [#35](https://gitlab.com/linagora/petals-cockpit/issues/35)

