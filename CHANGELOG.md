<a name="1.11.0"></a>
# [1.11.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.10.0...v1.11.0) (2020-09-18)


### Bug Fixes

* **backend:** new workspace user has now no permission ([2c2a623](https://gitlab.com/linagora/petals-cockpit/commit/2c2a623d84af02bbc6259bd1dee271f18b855dce)), closes [#563](https://gitlab.com/linagora/petals-cockpit/issues/563)

### Features

* **backend:** return workspace users with their name ([6faa995](https://gitlab.com/linagora/petals-cockpit/commit/6faa99578a13739bfc4a25bc72825dedd1b71f01))
* **frontend:** add endpoints list to service view ([569b784](https://gitlab.com/linagora/petals-cockpit/commit/569b784d7ab96cf0165c5be1939427ee052663d5)), closes [#602](https://gitlab.com/linagora/petals-cockpit/issues/602)
* **frontend:** add services breadcrumbs ([e800edc](https://gitlab.com/linagora/petals-cockpit/commit/e800edc3c677fa07657bde8999874106cc152504)), closes [#704](https://gitlab.com/linagora/petals-cockpit/issues/704) [#592](https://gitlab.com/linagora/petals-cockpit/issues/592)
* **frontend:** refactor endpoint view ([2132421](https://gitlab.com/linagora/petals-cockpit/commit/21324215f82ff2def9a1bab01bfb6190ad90d961)), closes [#598](https://gitlab.com/linagora/petals-cockpit/issues/598)
* **frontend:** refactor interface view ([6131a2d](https://gitlab.com/linagora/petals-cockpit/commit/6131a2d5fea3a7154ad60f0a87381427f3907178)), closes [#600](https://gitlab.com/linagora/petals-cockpit/issues/600)
* **frontend:** refactor service view ([2aa8fb7](https://gitlab.com/linagora/petals-cockpit/commit/2aa8fb7d2cd1eb17a9477adb47e44b297432931c)), closes [#607](https://gitlab.com/linagora/petals-cockpit/issues/607)



<a name="1.10.0"></a>
# [1.10.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.9.0...v1.10.0) (2020-09-03)


### Bug Fixes

* **frontend:** fix workspace descriptions alignment when they are empty ([f191018](https://gitlab.com/linagora/petals-cockpit/commit/f191018f7f3b4c7c8094d881a0f1af4cea6c0d38)), closes [#694](https://gitlab.com/linagora/petals-cockpit/issues/694)
* **frontend:** fix no up to date workspace list on workspace deletion ([84652a2](https://gitlab.com/linagora/petals-cockpit/commit/84652a2869dae50953eade6afe6b5745b718dc9c)), closes [#695](https://gitlab.com/linagora/petals-cockpit/issues/695)


### Features

* **backend:** change workspace content to get services relations ([8894bfa](https://gitlab.com/linagora/petals-cockpit/commit/8894bfafa8ca96fb5f98f541689a988ba3a0acc3)), closes [#562](https://gitlab.com/linagora/petals-cockpit/issues/562)
* **frontend:** add breadcrumb for not found topology elements ([d6d4627](https://gitlab.com/linagora/petals-cockpit/commit/d6d4627ff851b460b8bf5737c4a23297d991519a))
* **frontend:** restrict available action according to deploy artifact permission ([7e3ce59](https://gitlab.com/linagora/petals-cockpit/commit/7e3ce5968f681604742e547ca5c8f9c832a599d3)), closes [#568](https://gitlab.com/linagora/petals-cockpit/issues/568)



<a name="1.9.0"></a>
# [1.9.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.8.0...v1.9.0) (2020-07-06)


### Bug Fixes

* **back:** admin cockpit is now allowed to do as workspace admin ([ba7528f](https://gitlab.com/linagora/petals-cockpit/commit/ba7528f009e70a52389d9084d9a3cb47910cb3df))
* **frontend:** fix bug while reloading workspace list ([2a83bea](https://gitlab.com/linagora/petals-cockpit/commit/2a83bea556cce8945133653cf5e33292e95a6be4))
* **frontend:** make bus import error notification more readable ([b0ef5d0](https://gitlab.com/linagora/petals-cockpit/commit/b0ef5d05153819aa81cb0f8447559084afc20f1f)), closes [#682](https://gitlab.com/linagora/petals-cockpit/issues/682)
* **frontend:** make topology info message full size ([b834b80](https://gitlab.com/linagora/petals-cockpit/commit/b834b8013a8181af08ddfcfed9a35f73330bd0f9)), closes [#687](https://gitlab.com/linagora/petals-cockpit/issues/687)


### Features

* **backend:** prevent last admin workspace to leave ([90ad29c](https://gitlab.com/linagora/petals-cockpit/commit/90ad29c94bdf62f6bad46b9e3db4e3e6db09c71d)), closes [#680](https://gitlab.com/linagora/petals-cockpit/issues/680)
* **frontend:** add element name on their overview page ([0f9ea01](https://gitlab.com/linagora/petals-cockpit/commit/0f9ea01ecd10752e9db43033422a6bbc724d5804)), closes [#684](https://gitlab.com/linagora/petals-cockpit/issues/684)
* **frontend:** add led state to topology tree ([cc00f03](https://gitlab.com/linagora/petals-cockpit/commit/cc00f035c6efd527e5ff147da5a0bd3fd5f5ea2a)), closes [#665](https://gitlab.com/linagora/petals-cockpit/issues/665)
* **frontend:** add tooltip to breadcrumbs 1s delay ([5678164](https://gitlab.com/linagora/petals-cockpit/commit/5678164c2036d240b631032d192b9c1577318e77))
* **frontend:** authorize adminCockpit without adminWorkspace permission to do some actions on workspaces ([e5d2b16](https://gitlab.com/linagora/petals-cockpit/commit/e5d2b161200b110d4fe872b3ec7a68a93a890f57))
* **frontend:** end of large breadcrumb elements are now hidden by three dots ([ab9f99b](https://gitlab.com/linagora/petals-cockpit/commit/ab9f99bdcf72ce03c25f595478bfbdfb76164426))
* **frontend:** display breadcrumbs icons only when screen is large enough ([cb734d6](https://gitlab.com/linagora/petals-cockpit/commit/cb734d69ed4080da5fd182f55dac332c55ea0fa8))
* **frontend:** restrict available action according to workspace administrator permission ([3056cfa](https://gitlab.com/linagora/petals-cockpit/commit/3056cfab1bc49a741651dbfc994798a04adc1ae3)), closes [#567](https://gitlab.com/linagora/petals-cockpit/issues/567)
* **frontend:** should not leave workspace without admin remaining ([0b11812](https://gitlab.com/linagora/petals-cockpit/commit/0b1181224d09bfaa0a43c97165b267e931c383b2)), closes [#681](https://gitlab.com/linagora/petals-cockpit/issues/681)
* **frontend:** upgraded breadcrumb look ([bf5706c](https://gitlab.com/linagora/petals-cockpit/commit/bf5706c519ed8f069babcbae436cfe8527d33434)), closes [#528](https://gitlab.com/linagora/petals-cockpit/issues/528)



<a name="1.8.0"></a>
# [1.8.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.7.0...v1.8.0) (2020-06-09)


### Bug Fixes

* **frontend:** remove unused horizontal scrollbar in SU view ([38214f5](https://gitlab.com/linagora/petals-cockpit/commit/38214f54c1a7b6299e61e71b91740e0b63d1b09a)), closes [#678](https://gitlab.com/linagora/petals-cockpit/issues/678)


### Features

* **frontend:** add leave workspace button ([41811d2](https://gitlab.com/linagora/petals-cockpit/commit/41811d2d36c598540c96573a014722623bce46c4)), closes [#668](https://gitlab.com/linagora/petals-cockpit/issues/668)
* **frontend:** add state text in SA view ([2efd961](https://gitlab.com/linagora/petals-cockpit/commit/2efd961f0147b667018eb1ca3e4eba323cb7c9e2)), closes [#669](https://gitlab.com/linagora/petals-cockpit/issues/669)



<a name="1.7.0"></a>
# [1.7.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.6.0...v1.7.0) (2020-04-27)


### Features

* **backend:** users can leave workspaces ([d9029ce](https://gitlab.com/linagora/petals-cockpit/commit/d9029ce0864ab426026d12baea985ac0ab221c02)), closes [#667](https://gitlab.com/linagora/petals-cockpit/issues/667)
* **frontend:** align related component element and resize message boxes ([36d266f](https://gitlab.com/linagora/petals-cockpit/commit/36d266f105e03c06218e3466c36f4c5bb8965cb3)), closes [#651](https://gitlab.com/linagora/petals-cockpit/issues/651) [#659](https://gitlab.com/linagora/petals-cockpit/issues/659)



<a name="1.6.0"></a>
# [1.6.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.5.0...v1.6.0) (2020-04-06)


### Bug Fixes

* **backend:** incorrect error message ([09e0e56](https://gitlab.com/linagora/petals-cockpit/commit/09e0e566e007b09dd5f0ae83739b4c81c1d0e496))
* **frontend:** issues while switching views ([c301b0e](https://gitlab.com/linagora/petals-cockpit/commit/c301b0effcc34bf941e5bd40276bd388e6d27e25), [5665592](https://gitlab.com/linagora/petals-cockpit/commit/56655928cb6807ebe5a7d630eba09d58b38894d3)), closes [#660](https://gitlab.com/linagora/petals-cockpit/issues/660)



### Features

* **backend:** cli add-user now checks ldap for argument -l ([3089f54](https://gitlab.com/linagora/petals-cockpit/commit/3089f54e43809edc6c57da649c74dba7f828f94f)), closes [#505](https://gitlab.com/linagora/petals-cockpit/issues/505)
* **backend:** cli add-user now adds user to existing workspace ([87a13da](https://gitlab.com/linagora/petals-cockpit/commit/87a13daf99464a0440f6344902a5a4dd0d511677)), closes [#639](https://gitlab.com/linagora/petals-cockpit/issues/639)
* **backend:** cli add-user now handles workspace permissions ([21ac0f0](https://gitlab.com/linagora/petals-cockpit/commit/21ac0f035a7fc91ca83872b864ca48b5b140a85d)), closes [#657](https://gitlab.com/linagora/petals-cockpit/issues/657)
* **frontend:** edit & save users permissions ([eeafdcf](https://gitlab.com/linagora/petals-cockpit/commit/eeafdcf2449b071b8710ab39d5581780ecff143e)), closes [#605](https://gitlab.com/linagora/petals-cockpit/issues/605) [#606](https://gitlab.com/linagora/petals-cockpit/issues/606) [#585](https://gitlab.com/linagora/petals-cockpit/issues/585) [#580](https://gitlab.com/linagora/petals-cockpit/issues/580)
* **frontend:** refactor petals topology tree ([b5e51d8](https://gitlab.com/linagora/petals-cockpit/commit/b5e51d8842202958f9ece430ab58dba5f1342353)), closes [#664](https://gitlab.com/linagora/petals-cockpit/issues/664)




<a name="1.5.0"></a>
# [1.5.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.4.0...v1.5.0) (2020-03-16)


### Bug Fixes

* **backend:** allow to deploy an already deployed SA ([9a398b8](https://gitlab.com/linagora/petals-cockpit/commit/9a398b881f9d7f9d3d452c135ec55bbbb1d8acdf)), closes [#631](https://gitlab.com/linagora/petals-cockpit/issues/631)
* **frontend:** clean import bus error message when switching workspace ([bd07419](https://gitlab.com/linagora/petals-cockpit/commit/bd0741937d572fb26a72b707268291fc3279b808)), closes [#654](https://gitlab.com/linagora/petals-cockpit/issues/654)
* **frontend:** display error messages correctly at minimum supported size ([f12a20b](https://gitlab.com/linagora/petals-cockpit/commit/f12a20b40ae7c0b3d7d689c34fa70a82621b3d80)), closes [#652](https://gitlab.com/linagora/petals-cockpit/issues/652)


### Features

* **backend:** workspace name is now limited to 100 characters ([69365e6](https://gitlab.com/linagora/petals-cockpit/commit/69365e6f4273f81e8243696d5d50fcae89ca9bc8)), closes [#526](https://gitlab.com/linagora/petals-cockpit/issues/526)
* **front:** restrict name and short description maximum lengths when creating new workspace ([a3cfea0](https://gitlab.com/linagora/petals-cockpit/commit/a3cfea01435f57657c789ba86a118e9f8f11a647))
* **frontend:** allow to deploy an already deployed SA ([07b43a9](https://gitlab.com/linagora/petals-cockpit/commit/07b43a9b0b4c626b7d4aad1b08be310be2d21203)), closes [#653](https://gitlab.com/linagora/petals-cockpit/issues/653)
* **frontend:** improve the form to add a user to a workspace ([29fd3c0](https://gitlab.com/linagora/petals-cockpit/commit/29fd3c0687bee981482b5a45450b65219a422604))
* **frontend:** display users permissions on workspace overview ([3036a62](https://gitlab.com/linagora/petals-cockpit/commit/3036a62511a5902b5c8c98f4899ba3f3622e3ce7)), closes [#584](https://gitlab.com/linagora/petals-cockpit/issues/584) [#586](https://gitlab.com/linagora/petals-cockpit/issues/586)
* **frontend:** make service assembly view read-only after deletion ([b757126](https://gitlab.com/linagora/petals-cockpit/commit/b757126b734488575bd4500fde32a81359443a74)), closes [#648](https://gitlab.com/linagora/petals-cockpit/issues/648)
* **frontend:** make shared library view read-only after deletion ([9ea3dab](https://gitlab.com/linagora/petals-cockpit/commit/9ea3dabe0bbf08cf190408317fe064cb43dcd14e)), closes [#647](https://gitlab.com/linagora/petals-cockpit/issues/647)
* **frontend:** improve service assembly view ([41530c4](https://gitlab.com/linagora/petals-cockpit/commit/41530c43ac646761435b106f261cb4d9126eb538)), closes [#643](https://gitlab.com/linagora/petals-cockpit/issues/643) [#644](https://gitlab.com/linagora/petals-cockpit/issues/644)
* **frontend:** return permissons when adding a user to a workspace ([586c25f](https://gitlab.com/linagora/petals-cockpit/commit/586c25f9c19c5c044afad795984505a1608e3462))



<a name="1.4.0"></a>
# [1.4.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.03.0...v1.4.0) (2020-02-24)


### Bug Fixes

* **backend:** verify if a user is already in the workspace before adding him to it ([1de0f9d](https://gitlab.com/linagora/petals-cockpit/commit/1de0f9ddd86abfcfcd03a6eb735df167fa42a677))
* **backend:** prevent admins from adding a user with same username but not same case as an existing user ([9166f61](https://gitlab.com/linagora/petals-cockpit/commit/9166f610b89cd8761b4ec70bd24815a966db58fd)), closes [#640](https://gitlab.com/linagora/petals-cockpit/issues/640)


### Features

* **backend:** prevent usernames containing non-alphanumeric characters ([1d546b3](https://gitlab.com/linagora/petals-cockpit/commit/1d546b3b543f8af9b023ab155bcb2515a496d5cb)), closes [#638](https://gitlab.com/linagora/petals-cockpit/issues/638)
* **frontend:** prevent usernames containing non-alphanumeric characters ([51e8f1d](https://gitlab.com/linagora/petals-cockpit/commit/51e8f1df06133960afdaf17d66ac80c348032a24))
* **frontend:** component informations are read-only after deletion ([f70603c](https://gitlab.com/linagora/petals-cockpit/commit/f70603cd4f146fe4f3ddbb6462409ba2bf697d8f)), closes [#630](https://gitlab.com/linagora/petals-cockpit/issues/630)
* **frontend:** refactor service unit view ([949261f](https://gitlab.com/linagora/petals-cockpit/commit/949261fab5622d2030a15d189d78778c62e6977c)), closes [#642](https://gitlab.com/linagora/petals-cockpit/issues/642)
* **frontend:** refactor shared libraries view ([d05c812](https://gitlab.com/linagora/petals-cockpit/commit/d05c8122bb6311fea6d156e036239818f36dea11)), closes [#646](https://gitlab.com/linagora/petals-cockpit/issues/646) [#645](https://gitlab.com/linagora/petals-cockpit/issues/645)



<a name="1.03.0"></a>
# [1.03.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.02.0...v1.03.0) (2020-01-28)


### Bug Fixes

* **backend:** make isAdmin field in edit user optional ([2b06e0d](https://gitlab.com/linagora/petals-cockpit/commit/2b06e0d4a4504cd5fa9b283827f616783f1c38e7)), closes [#624](https://gitlab.com/linagora/petals-cockpit/issues/624)
* **frontend:** dismiss snackbar when su deployment failed ([e6be33b](https://gitlab.com/linagora/petals-cockpit/commit/e6be33bc01785a98b098c28015a302bd27eb3d57))
* **frontend:** get su from zip file only if file is selected ([ed013c6](https://gitlab.com/linagora/petals-cockpit/commit/ed013c66d8fd4c392788479a7300ba39998d328a))
* **frontend:** prevent adding duplicated users to cockpit users ([8133686](https://gitlab.com/linagora/petals-cockpit/commit/813368642fe4b364a179206f60bbb08ecb9226c8)), closes [#619](https://gitlab.com/linagora/petals-cockpit/issues/619)
* **frontend:** fix reset fields before submitting user ([c9d1c81](https://gitlab.com/linagora/petals-cockpit/commit/c9d1c81b8ed9f56f5cf97dd213951ed91a8560a1)), closes [#617](https://gitlab.com/linagora/petals-cockpit/issues/617)
* **frontend:** thow error reading zip without jbi ([7af90fb](https://gitlab.com/linagora/petals-cockpit/commit/7af90fb6b6d9d5369903f56858916603ee5f5351)), closes [#615](https://gitlab.com/linagora/petals-cockpit/issues/615)


### Features

* **frontend:** improve component related elements view ([c820205](https://gitlab.com/linagora/petals-cockpit/commit/c8202058468998337787367fb6e45cbfc3a404fd)), closes [#634](https://gitlab.com/linagora/petals-cockpit/issues/634)
* **frontend:** merge component details with lifecycle ([0b1b70d](https://gitlab.com/linagora/petals-cockpit/commit/0b1b70d6e8334ecee9efc43b4d83ddba26a1b7d5)), closes [#574](https://gitlab.com/linagora/petals-cockpit/issues/574), [#575](https://gitlab.com/linagora/petals-cockpit/issues/575)
* **frontend:** remove tabs in service unit view ([bd2cfe9](https://gitlab.com/linagora/petals-cockpit/commit/bd2cfe9453fe5c780e20eb2d0fc809493bd7a174)), closes [#626](https://gitlab.com/linagora/petals-cockpit/issues/626)
* **frontend:** remove tabs in shared library view ([4c9eccd](https://gitlab.com/linagora/petals-cockpit/commit/4c9eccd9cfab37014e1b0ff2c40088943beda269)), closes [#627](https://gitlab.com/linagora/petals-cockpit/issues/627)
* **frontend:** remove tabs in service assembly view ([06f6dbe](https://gitlab.com/linagora/petals-cockpit/commit/06f6dbe331f7d869ed55a998bc94a62f883da1c6)), closes [#628](https://gitlab.com/linagora/petals-cockpit/issues/628)
* **frontend:** add admin cockpit manager ([f6eb631](https://gitlab.com/linagora/petals-cockpit/commit/f6eb6319a8b2192676972011620ed56963b19e2e))
* **frontend:** disable save button when no change in user administration ([119e80a](https://gitlab.com/linagora/petals-cockpit/commit/119e80aa3c9029eea3e5455d08873e3390f52d4e))



<a name="1.02.0"></a>
# [1.02.0](https://gitlab.com/linagora/petals-cockpit/compare/v1.01.0...v1.02.0) (2020-01-06)


### Bug Fixes

* **backend:** unload sl when another share same name ([af0190c](https://gitlab.com/linagora/petals-cockpit/commit/af0190c)), closes [#597](https://gitlab.com/linagora/petals-cockpit/issues/597)
* **frontend:** bug with autofill setting ([b335a90](https://gitlab.com/linagora/petals-cockpit/commit/b335a90)), closes [#519](https://gitlab.com/linagora/petals-cockpit/issues/519)


### Features

* **backend:** add cockpit admin and workspace permissions security. Security is activated on backend (but all permissions are given by default for now) ([5b0074e](https://gitlab.com/linagora/petals-cockpit/commit/5b0074e)), closes [#547](https://gitlab.com/linagora/petals-cockpit/issues/547)
* **product:** prevent workspaces duplicates ([b428cac](https://gitlab.com/linagora/petals-cockpit/commit/b428cac)), closes [#595](https://gitlab.com/linagora/petals-cockpit/issues/595)
* **frontend:** remove tabs of component view ([d0d539a](https://gitlab.com/linagora/petals-cockpit/commit/d0d539a)), closes [#571](https://gitlab.com/linagora/petals-cockpit/issues/571)



<a name="1.01.0"></a>
# [1.01.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.27.0...v1.01.0) (2019-12-05)


### General

* **frontend:** We took some time to refactor almost all of the frontend user interface. Bus elements overview (like component, SA, SU, SL) and services views remain to be done. **But we are back in sprint mode !**


### Bug Fixes

* **frontend:** display containers graph even with a single container ([f5f2632](https://gitlab.com/linagora/petals-cockpit/commit/f5f2632))
* **frontend:** fix color theme reset after logout ([2d54005](https://gitlab.com/linagora/petals-cockpit/commit/2d54005)), closes [#495](https://gitlab.com/linagora/petals-cockpit/issues/495)


### Features

* **backend:** add default description to workspace at creation ([e41e95a](https://gitlab.com/linagora/petals-cockpit/commit/e41e95a)), closes [#523](https://gitlab.com/linagora/petals-cockpit/issues/523)
* **backend:** enforce workspace name uniqueness ([e11d143](https://gitlab.com/linagora/petals-cockpit/commit/e11d143)), closes [#541](https://gitlab.com/linagora/petals-cockpit/issues/541)
* **frontend:** add workspace name to the breadcrumb ([3349726](https://gitlab.com/linagora/petals-cockpit/commit/3349726)), closes [#534](https://gitlab.com/linagora/petals-cockpit/issues/534)
* **frontend:** attach bus from workspace overview ([b4d9c2f](https://gitlab.com/linagora/petals-cockpit/commit/b4d9c2f)), closes [#554](https://gitlab.com/linagora/petals-cockpit/issues/554)
* **frontend:** detach bus from workspace overview ([4965f8b](https://gitlab.com/linagora/petals-cockpit/commit/4965f8b))
* **frontend:** sort columns of container list ([041ecec](https://gitlab.com/linagora/petals-cockpit/commit/041ecec))
* **frontend:** sort workspaces by name ([af0baa1](https://gitlab.com/linagora/petals-cockpit/commit/af0baa1)), closes [#539](https://gitlab.com/linagora/petals-cockpit/issues/539)
* **frontend:** sort workspaces by name in workspaces list ([9e5c1ed](https://gitlab.com/linagora/petals-cockpit/commit/9e5c1ed)), closes [#540](https://gitlab.com/linagora/petals-cockpit/issues/540)
* **frontend:** toggle visibility of password ([865e9fe](https://gitlab.com/linagora/petals-cockpit/commit/865e9fe))



<a name="1.00.0-beta"></a>
# [1.00.0-beta](https://gitlab.com/linagora/petals-cockpit/compare/v1.00.0-beta...v0.27.0) (2018-09-07)


### General

* **product:** Released **beta version 1.00.0** (Based of version 0.27.0)



<a name="0.27.0"></a>
# [0.27.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.26.0...v0.27.0) (2018-09-07)


### Bug Fixes

* **frontend** ldap search user autocomplete panel scroll ([5f819ae2](https://gitlab.com/linagora/petals-cockpit/commit/5f819ae2)), closes [#502](https://gitlab.com/linagora/petals-cockpit/issues/502)
* **frontend**  improved error message when backend is down ([b53326d9](https://gitlab.com/linagora/petals-cockpit/commit/b53326d9)), closes [#423](https://gitlab.com/linagora/petals-cockpit/issues/423)
* **frontend**  workspace description markdown edit ([7a870905](https://gitlab.com/linagora/petals-cockpit/commit/7a870905)), closes [#508](https://gitlab.com/linagora/petals-cockpit/issues/508)
* **backend:** change add-user parameters check ([34f1947](https://gitlab.com/linagora/petals-cockpit/commit/34f1947)), closes [#503](https://gitlab.com/linagora/petals-cockpit/issues/503)
* **backend:** duplicate bus import is now forbidden ([13e83d8](https://gitlab.com/linagora/petals-cockpit/commit/13e83d8)), closes [#463](https://gitlab.com/linagora/petals-cockpit/issues/463)
* **backend:** http server external host can be configured ([acb2ef8](https://gitlab.com/linagora/petals-cockpit/commit/acb2ef8)), closes [#511](https://gitlab.com/linagora/petals-cockpit/issues/511)
* **backend:** import bus with unreachable container in topology ([ce0ce41](https://gitlab.com/linagora/petals-cockpit/commit/ce0ce41)), closes [#500](https://gitlab.com/linagora/petals-cockpit/issues/500)
* **backend:** improved error message when deploying a sa/su on a component in the wrong state ([62367ad](https://gitlab.com/linagora/petals-cockpit/commit/62367ad)), closes [#458](https://gitlab.com/linagora/petals-cockpit/issues/458)


### Features

* **product:** ldap setup page ([785b18b2](https://gitlab.com/linagora/petals-cockpit/commit/785b18b2)), closes [#506](https://gitlab.com/linagora/petals-cockpit/issues/506)



<a name="0.26.0"></a>
# [0.26.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.25.0...v0.26.0) (2018-08-17)


### Bug Fixes

* **backend:** fix nullcheck on ldap entries ([5e79886](https://gitlab.com/linagora/petals-cockpit/commit/5e79886))


### Features

* **backend:** get ldap user list by name ([66c3d78](https://gitlab.com/linagora/petals-cockpit/commit/66c3d78))
* **frontend:** add ldap user ([0b7baf1](https://gitlab.com/linagora/petals-cockpit/commit/0b7baf1))
* **frontend:** search services ([84e6835](https://gitlab.com/linagora/petals-cockpit/commit/84e6835)), closes [#504](https://gitlab.com/linagora/petals-cockpit/issues/504)



<a name="0.25.0"></a>
# [0.25.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.24.0...v0.25.0) (2018-07-16)


### Bug Fixes

* **frontend:** clean workspace store to reset petals search bar ([c9a19e2](https://gitlab.com/linagora/petals-cockpit/commit/c9a19e2)), closes [#501](https://gitlab.com/linagora/petals-cockpit/issues/501)


### Features

* **backend:** automatically add user to db in ldap mode ([9db91df](https://gitlab.com/linagora/petals-cockpit/commit/9db91df))



<a name="0.24.0"></a>
# [0.24.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.23.0...v0.24.0) (2018-06-26)


### Features

* **backend:** ldap authentication ([8460069](https://gitlab.com/linagora/petals-cockpit/commit/8460069)), closes [#483](https://gitlab.com/linagora/petals-cockpit/issues/483)


<a name="0.23.0"></a>
# [0.23.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.22.0...v0.23.0) (2018-05-24)


### Bug Fixes

* **frontend:** fix bug with services updated ([d525036](https://gitlab.com/linagora/petals-cockpit/commit/d525036)), closes [#470](https://gitlab.com/linagora/petals-cockpit/issues/470)


<a name="0.22.0"></a>
# [0.22.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.21.0...v0.22.0) (2018-04-30)


### Bug Fixes

* **product:** add timeout to actual e2e tests to match real backend errors ([98fd117](https://gitlab.com/linagora/petals-cockpit/commit/98fd117))
* **frontend:** disable ripple on item-namespace in services trees ([258c08a](https://gitlab.com/linagora/petals-cockpit/commit/258c08a))
* **frontend:** fix buttons not visible on firefox ([0d70e07](https://gitlab.com/linagora/petals-cockpit/commit/0d70e07)), closes [#444](https://gitlab.com/linagora/petals-cockpit/issues/444)
* **frontend:** fix workspace selection dialog ([68ae62c](https://gitlab.com/linagora/petals-cockpit/commit/68ae62c)), closes [#449](https://gitlab.com/linagora/petals-cockpit/issues/449)
* **frontend:** use theme color and fix the align center of title ([eb15933](https://gitlab.com/linagora/petals-cockpit/commit/eb15933))
* **frontend:** remove services on bus deletion ([01157bc](https://gitlab.com/linagora/petals-cockpit/commit/01157bc)), closes [#462](https://gitlab.com/linagora/petals-cockpit/issues/462)


### Features

* **backend:** upgrade command add-user to generate a workspace ([dcea6d6](https://gitlab.com/linagora/petals-cockpit/commit/dcea6d6))
* **frontend:** add localStorage to keep theme selected in browser ([a6bfabb](https://gitlab.com/linagora/petals-cockpit/commit/a6bfabb)), closes [#460](https://gitlab.com/linagora/petals-cockpit/issues/460)
* **frontend:** add profile page of connected user ([cea4611](https://gitlab.com/linagora/petals-cockpit/commit/cea4611))
* **frontend:** add sl version in overview ([fe10a97](https://gitlab.com/linagora/petals-cockpit/commit/fe10a97)), closes [#448](https://gitlab.com/linagora/petals-cockpit/issues/448)
* **frontend:** also check sl version on upload ([a28b9b4](https://gitlab.com/linagora/petals-cockpit/commit/a28b9b4))
* **frontend:** choose colors and themes ([7afcd7c](https://gitlab.com/linagora/petals-cockpit/commit/7afcd7c))
* **frontend:** display endpoint details overview ([ccdc0a4](https://gitlab.com/linagora/petals-cockpit/commit/ccdc0a4)), closes [#453](https://gitlab.com/linagora/petals-cockpit/issues/453)
* **frontend:** display interface details overview ([6bf805a](https://gitlab.com/linagora/petals-cockpit/commit/6bf805a)), closes [#452](https://gitlab.com/linagora/petals-cockpit/issues/452)
* **frontend:** display service details overview ([74c3eda](https://gitlab.com/linagora/petals-cockpit/commit/74c3eda)), closes [#411](https://gitlab.com/linagora/petals-cockpit/issues/411)
* **frontend:** override shared libraries ([978253b](https://gitlab.com/linagora/petals-cockpit/commit/978253b)), closes [#435](https://gitlab.com/linagora/petals-cockpit/issues/435)
* **frontend:** refresh services button ([1dac1d2](https://gitlab.com/linagora/petals-cockpit/commit/1dac1d2)), closes [#468](https://gitlab.com/linagora/petals-cockpit/issues/468)



<a name="0.21.0"></a>
# [0.21.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.20.0...v0.21.0) (2018-03-05)


### Bug Fixes

* **frontend:** hint original component name ([8a741f8](https://gitlab.com/linagora/petals-cockpit/commit/8a741f8)), closes [#447](https://gitlab.com/linagora/petals-cockpit/issues/447)
* **frontend:** improve design on upload components ([1364a1f](https://gitlab.com/linagora/petals-cockpit/commit/1364a1f)), closes [#443](https://gitlab.com/linagora/petals-cockpit/issues/443)


### Features

* **frontend:** display the endpoints list ([6288c83](https://gitlab.com/linagora/petals-cockpit/commit/6288c83)), closes [#428](https://gitlab.com/linagora/petals-cockpit/issues/428)
* **frontend:** display the interfaces list ([52a44a7](https://gitlab.com/linagora/petals-cockpit/commit/52a44a7)), closes [#430](https://gitlab.com/linagora/petals-cockpit/issues/430)



<a name="0.20.0"></a>
# [0.20.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.19.0...v0.20.0) (2018-02-20)


### Bug Fixes

* **frontend:** can togglefold tree after search ([ec76010](https://gitlab.com/linagora/petals-cockpit/commit/ec76010)), closes [#417](https://gitlab.com/linagora/petals-cockpit/issues/417)
* **frontend:** not send null name for components ([dd587ca](https://gitlab.com/linagora/petals-cockpit/commit/dd587ca)), closes [#425](https://gitlab.com/linagora/petals-cockpit/issues/425)
* **frontend:** problem reading zip ([0a33577](https://gitlab.com/linagora/petals-cockpit/commit/0a33577)), closes [#424](https://gitlab.com/linagora/petals-cockpit/issues/424)
* **frontend:** remove spinner when a component is removed ([a2feae4](https://gitlab.com/linagora/petals-cockpit/commit/a2feae4))
* **frontend:** remove white gap in administration ([776d165](https://gitlab.com/linagora/petals-cockpit/commit/776d165)), closes [#438](https://gitlab.com/linagora/petals-cockpit/issues/438)
* **frontend:** fix display services list and upgrade services list to services tree ([e1e69e2](https://gitlab.com/linagora/petals-cockpit/commit/e1e69e2)), closes [#437](https://gitlab.com/linagora/petals-cockpit/issues/437)
* **backend:** services update conditions and DB consistency ([740cc66](https://gitlab.com/linagora/petals-cockpit/commit/740cc66))



<a name="0.19.0"></a>
# [0.19.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.18.0...v0.19.0) (2018-01-29)


### Features

* **frontend:** upgrade services list to services tree ([64f12d1](https://gitlab.com/linagora/petals-cockpit/commit/64f12d1)), closes [#422](https://gitlab.com/linagora/petals-cockpit/issues/422)



<a name="0.18.0"></a>
# [0.18.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.17.0...v0.18.0) (2018-01-02)


### Features

* Display services list in a new tab, closes [#406](https://gitlab.com/linagora/petals-cockpit/issues/406)
* **frontend:** Selected left menu tab is restored on page reload ([be31af8](https://gitlab.com/linagora/petals-cockpit/commit/be31af8)), closes [#418](https://gitlab.com/linagora/petals-cockpit/issues/418)



<a name="0.17.0"></a>
# [0.17.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.16.0...v0.17.0) (2017-12-08)


### Bug Fixes

* **frontend:** informational messages are no longer always closable ([a2f73b1](https://gitlab.com/linagora/petals-cockpit/commit/a2f73b1)), closes [#404](https://gitlab.com/linagora/petals-cockpit/issues/404)


### Features

* **frontend:** display unreachable containers with a message to explain ([d1a94fa](https://gitlab.com/linagora/petals-cockpit/commit/d1a94fa)), closes [#399](https://gitlab.com/linagora/petals-cockpit/issues/399)
* **frontend:** retry failed bus import ([a89f416](https://gitlab.com/linagora/petals-cockpit/commit/a89f416)), closes [#405](https://gitlab.com/linagora/petals-cockpit/issues/405)



<a name="0.16.0"></a>
# [0.16.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.15.0...v0.16.0) (2017-11-29)


### Features

* **frontend:** edit component name before deploy, checking duplicates ([7900829](https://gitlab.com/linagora/petals-cockpit/commit/7900829)), closes [#329](https://gitlab.com/linagora/petals-cockpit/issues/329)
* **frontend:** edit shared library name before deploy, checking duplicates ([26c087d](https://gitlab.com/linagora/petals-cockpit/commit/26c087d)), closes [#393](https://gitlab.com/linagora/petals-cockpit/issues/393)
* **frontend:** search input is reset upon info message closure ([dadefc5](https://gitlab.com/linagora/petals-cockpit/commit/dadefc5)), closes [#403](https://gitlab.com/linagora/petals-cockpit/issues/403)


<a name="0.15.0"></a>
# [0.15.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.14.0...v0.15.0) (2017-11-13)


### Bug Fixes

* **backend:** unprocessable zip now returns HTTP 422 ([c438ec4](https://gitlab.com/linagora/petals-cockpit/commit/c438ec4)), closes [#400](https://gitlab.com/linagora/petals-cockpit/issues/400)


### Features

* **frontend:** display upload progress when uploading component|SA|SL|SU ([2cee8aa](https://gitlab.com/linagora/petals-cockpit/commit/2cee8aa))
* **frontend:** show the component in the SU overview ([4861cac](https://gitlab.com/linagora/petals-cockpit/commit/4861cac)), closes [#391](https://gitlab.com/linagora/petals-cockpit/issues/391)


<a name="0.14.0"></a>
# [0.14.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.13.0...v0.14.0) (2017-10-24)


### Features

* **frontend:** Display errors in a separated modal ([c3a9401](https://gitlab.com/linagora/petals-cockpit/commit/c3a9401)), closes [#373](https://gitlab.com/linagora/petals-cockpit/issues/373)



<a name="0.13.0"></a>
# [0.13.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.12.0...v0.13.0) (2017-10-04)


### Bug Fixes

* **backend:** improved Cockpit behaviour when Petals ESB is not exposing components MBean configuration ([48b4bd2](https://gitlab.com/linagora/petals-cockpit/commit/48b4bd2)), closes [#379](https://gitlab.com/linagora/petals-cockpit/issues/379)


### Features

Show and modify component configuration parameters, closes [#184](https://gitlab.com/linagora/petals-cockpit/issues/184)
* **frontend:** add a list of all its SUs and SA in component overview ([9afe29b](https://gitlab.com/linagora/petals-cockpit/commit/9afe29b)), closes [#327](https://gitlab.com/linagora/petals-cockpit/issues/327)



<a name="0.12.0"></a>
# [0.12.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.11.0...v0.12.0) (2017-09-18)


### Bug Fixes

* **backend:** we shouldn't be able to deploy the same component twice ([4675b2b](https://gitlab.com/linagora/petals-cockpit/commit/4675b2b)), closes [#386](https://gitlab.com/linagora/petals-cockpit/issues/386)
* **frontend:** 404 image broken (because of absolute path) ([c5225c8](https://gitlab.com/linagora/petals-cockpit/commit/c5225c8)), closes [#382](https://gitlab.com/linagora/petals-cockpit/issues/382)
* **frontend:** reset deploy (COMP/SA/SL) when changing from a container to another ([a363e70](https://gitlab.com/linagora/petals-cockpit/commit/a363e70))
* **frontend:** reset deploy SU when changing from a component to another ([ee08569](https://gitlab.com/linagora/petals-cockpit/commit/ee08569)), closes [#380](https://gitlab.com/linagora/petals-cockpit/issues/380)


### Features

* **frontend:** display an hover with opacity when a component is deleted instead of redirecting somewhere else ([c9029bb](https://gitlab.com/linagora/petals-cockpit/commit/c9029bb))
* **frontend:** keep the redux devstore extension on even in prod ([c976efb](https://gitlab.com/linagora/petals-cockpit/commit/c976efb))
* **frontend:** order component install parameter alphabetically ([bda1742](https://gitlab.com/linagora/petals-cockpit/commit/bda1742)), closes [#378](https://gitlab.com/linagora/petals-cockpit/issues/378)
* **frontend:** proper deletion message for bus in progresses ([fb1a542](https://gitlab.com/linagora/petals-cockpit/commit/fb1a542)), closes [#251](https://gitlab.com/linagora/petals-cockpit/issues/251)
* **frontend:** reset upload component's input on upload success ([30ba42c](https://gitlab.com/linagora/petals-cockpit/commit/30ba42c)), closes [#381](https://gitlab.com/linagora/petals-cockpit/issues/381)
* **frontend:** unfold element parents in tree when selected ([81b4fd5](https://gitlab.com/linagora/petals-cockpit/commit/81b4fd5)), closes [#384](https://gitlab.com/linagora/petals-cockpit/issues/384)


### Performance Improvements

* **frontend:** add trackBy on multiple ngFor ([943059c](https://gitlab.com/linagora/petals-cockpit/commit/943059c))



<a name="0.11.0"></a>
# [0.11.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.10.1...v0.11.0) (2017-07-17)


### Bug Fixes

* **frontend:** do not close sidenav when escape key is pressed ([462378e](https://gitlab.com/linagora/petals-cockpit/commit/462378e))
* **frontend:** fix redirect when event received via SSE ([efb2309](https://gitlab.com/linagora/petals-cockpit/commit/efb2309)), closes [#306](https://gitlab.com/linagora/petals-cockpit/issues/306)
* **frontend:** simplify selectors to avoid undefined on workspace clean ([d4f366a](https://gitlab.com/linagora/petals-cockpit/commit/d4f366a)), closes [#369](https://gitlab.com/linagora/petals-cockpit/issues/369)
* **product:** fix 404 when deploying artefacts ([4c8c16f](https://gitlab.com/linagora/petals-cockpit/commit/4c8c16f))


### Features

* Manage application users as an admin, closes [#361](https://gitlab.com/linagora/petals-cockpit/issues/361)
* workspace administration, closes [#9](https://gitlab.com/linagora/petals-cockpit/issues/9)
* **backend:** explicit error on setup failure ([f3e6fc7](https://gitlab.com/linagora/petals-cockpit/commit/f3e6fc7))
* **frontend:** group artifacts by type in the tree ([e529a90](https://gitlab.com/linagora/petals-cockpit/commit/e529a90)), closes [#342](https://gitlab.com/linagora/petals-cockpit/issues/342) [#368](https://gitlab.com/linagora/petals-cockpit/issues/368)
* **product:** add --debug flag to start script [ci skip] ([9e7bcc7](https://gitlab.com/linagora/petals-cockpit/commit/9e7bcc7))



<a name="0.10.1"></a>
## [0.10.1](https://gitlab.com/linagora/petals-cockpit/compare/v0.10.0...v0.10.1) (2017-06-23)


### Bug Fixes

* **product:** fix 404 when deploying artefacts ([e659980](https://gitlab.com/linagora/petals-cockpit/commit/e659980))



<a name="0.10.0"></a>
# [0.10.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.9.0...v0.10.0) (2017-06-21)


### Bug Fixes

* **frontend:** do not show error in new workspace form ([bc51835](https://gitlab.com/linagora/petals-cockpit/commit/bc51835)), closes [#331](https://gitlab.com/linagora/petals-cockpit/issues/331)


### Features

* introduces shared libraries, closes [#332](https://gitlab.com/linagora/petals-cockpit/issues/332), [#347](https://gitlab.com/linagora/petals-cockpit/issues/347), [#352](https://gitlab.com/linagora/petals-cockpit/issues/352)
* deploy service-assembly ([921d992](https://gitlab.com/linagora/petals-cockpit/commit/921d992)), closes [#323](https://gitlab.com/linagora/petals-cockpit/issues/323), [#316](https://gitlab.com/linagora/petals-cockpit/issues/316)
* **frontend:** graph of reachabilities in container overview ([7b8e577](https://gitlab.com/linagora/petals-cockpit/commit/7b8e577)), closes [#310](https://gitlab.com/linagora/petals-cockpit/issues/310)
* **frontend:** handle 404 by redirecting to a simple 404 not found page ([3d69ab4](https://gitlab.com/linagora/petals-cockpit/commit/3d69ab4)), closes [#340](https://gitlab.com/linagora/petals-cockpit/issues/340)
* **frontend:** various UI improvements for coherence sake



<a name="0.9.0"></a>
# [0.9.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.8.0...v0.9.0) (2017-05-29)


### Bug Fixes

* **frontend:** ensure ws delete button is disabled ([9a75831](https://gitlab.com/linagora/petals-cockpit/commit/9a75831))
* **frontend:** only ignore non parameter-related changes in component install change detection ([401cc0a](https://gitlab.com/linagora/petals-cockpit/commit/401cc0a))
* **frontend:** tabs in sidenav are properly sized ([d888e8b](https://gitlab.com/linagora/petals-cockpit/commit/d888e8b))
* **product:** disable admin connector from dropwizard ([1caa3ff](https://gitlab.com/linagora/petals-cockpit/commit/1caa3ff))

### Features

* Introduces service assemblies (deployment still missing!) ([0b2cc22](https://gitlab.com/linagora/petals-cockpit/commit/0b2cc22), [ddba446](https://gitlab.com/linagora/petals-cockpit/commit/ddba446)), closes [#319](https://gitlab.com/linagora/petals-cockpit/issues/319) [#320](https://gitlab.com/linagora/petals-cockpit/issues/320) [#321](https://gitlab.com/linagora/petals-cockpit/issues/321) [#322](https://gitlab.com/linagora/petals-cockpit/issues/322) [#324](https://gitlab.com/linagora/petals-cockpit/issues/324)
* Show error in case of deploy and lifecycle problems (Comp, SU and SA) ([999c4fa](https://gitlab.com/linagora/petals-cockpit/commit/999c4fa), [0a428f0](https://gitlab.com/linagora/petals-cockpit/commit/0a428f0)), closes [#325](https://gitlab.com/linagora/petals-cockpit/issues/325)
* Display containers in bus overview ([5aa6d22](https://gitlab.com/linagora/petals-cockpit/commit/5aa6d22)), closes [#309](https://gitlab.com/linagora/petals-cockpit/issues/309)
* Add admin on first start using a token ([b8c21bf](https://gitlab.com/linagora/petals-cockpit/commit/b8c21bf)), closes [#162](https://gitlab.com/linagora/petals-cockpit/issues/162)
* Show error in case of lifecycle problem - Su and comp ([586887f](https://gitlab.com/linagora/petals-cockpit/commit/586887f))
* **frontend:** improve workspace view ([c24b4bef](https://gitlab.com/linagora/petals-cockpit/commit/c24b4bef)), closes [#339](https://gitlab.com/linagora/petals-cockpit/issues/339)
* **frontend:** add o icon to SUs in tree ([d775c89](https://gitlab.com/linagora/petals-cockpit/commit/d775c89))
* **frontend:** move lifecycle management of component into operations tab ([04b9cde](https://gitlab.com/linagora/petals-cockpit/commit/04b9cde)), closes [#315](https://gitlab.com/linagora/petals-cockpit/issues/315)(https://gitlab.com/linagora/petals-cockpit/issues/322) [#324](https://gitlab.com/linagora/petals-cockpit/issues/324)
* **product:** add startup scripts in released zip, migrate db by default ([c329191](https://gitlab.com/linagora/petals-cockpit/commit/c329191), [a688a09](https://gitlab.com/linagora/petals-cockpit/commit/a688a09)), closes [#89](https://gitlab.com/linagora/petals-cockpit/issues/89)
* **product:** better artifact zip name ([e8699a8](https://gitlab.com/linagora/petals-cockpit/commit/e8699a8)), closes [#271](https://gitlab.com/linagora/petals-cockpit/issues/271)
* **product:** ensure access logs and logs go each to their own file ([10811ab](https://gitlab.com/linagora/petals-cockpit/commit/10811ab))
* **product:** print the url of the server on start ([c82c47a](https://gitlab.com/linagora/petals-cockpit/commit/c82c47a))



<a name="0.8.0"></a>
# [0.8.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.7.0...v0.8.0) (2017-04-25)


### Bug Fixes

* **product:** support unknown state for SU and components ([e2cffbf](https://gitlab.com/linagora/petals-cockpit/commit/e2cffbf)), closes [#312](https://gitlab.com/linagora/petals-cockpit/issues/312)
* **frontend:** wrap long words in error/warning/info classes ([20ec03a](https://gitlab.com/linagora/petals-cockpit/commit/20ec03a)), closes [#297](https://gitlab.com/linagora/petals-cockpit/issues/297)
* **frontend:** disable deploy button & input file during deployment ([4142bfc](https://gitlab.com/linagora/petals-cockpit/commit/4142bfcd1b87e4ce10a6f63d448392c944f6eca6)), closes [#305](https://gitlab.com/linagora/petals-cockpit/issues/305)

### Features

* **product:** add workspace descriptions ([fccfdce](https://gitlab.com/linagora/petals-cockpit/commit/fccfdce)), closes [#299](https://gitlab.com/linagora/petals-cockpit/issues/299) [#300](https://gitlab.com/linagora/petals-cockpit/issues/300) [#298](https://gitlab.com/linagora/petals-cockpit/issues/298)
* **product:** deploy component from a container ([e499168](https://gitlab.com/linagora/petals-cockpit/commit/e499168), [97692cc](https://gitlab.com/linagora/petals-cockpit/commit/97692cc)), closes [#239](https://gitlab.com/linagora/petals-cockpit/issues/239) [#235](https://gitlab.com/linagora/petals-cockpit/issues/235) [#182](https://gitlab.com/linagora/petals-cockpit/issues/182)
* **product:** install components with parameters ([8f7b1e4](https://gitlab.com/linagora/petals-cockpit/commit/8f7b1e4), [ae9aee1](https://gitlab.com/linagora/petals-cockpit/commit/ae9aee1)), closes [#304](https://gitlab.com/linagora/petals-cockpit/issues/304) [#303](https://gitlab.com/linagora/petals-cockpit/issues/303) [#183](https://gitlab.com/linagora/petals-cockpit/issues/183)
* **product:**  delete bus ([eaa08a2](https://gitlab.com/linagora/petals-cockpit/commit/eaa08a2)), closes [#301](https://gitlab.com/linagora/petals-cockpit/issues/301)
* **frontend:** move component and SU deployment in Operations tab ([0eac167](https://gitlab.com/linagora/petals-cockpit/commit/0eac167), [1dd6664](https://gitlab.com/linagora/petals-cockpit/commit/1dd6664)), closes [#307](https://gitlab.com/linagora/petals-cockpit/issues/307) [#308](https://gitlab.com/linagora/petals-cockpit/issues/308)




<a name="0.7.0"></a>
# [0.7.0](https://gitlab.com/linagora/petals-cockpit/compare/v0.6.0...v0.7.0) (2017-04-04)


### Bug Fixes

* **backend:** do not validate response bodies ([2d4dcc9](https://gitlab.com/linagora/petals-cockpit/commit/2d4dcc9)), closes [#134](https://gitlab.com/linagora/petals-cockpit/issues/134)
* **frontend:** fix redirect after bus import ok or discard ([b016a53](https://gitlab.com/linagora/petals-cockpit/commit/b016a53)), closes [#268](https://gitlab.com/linagora/petals-cockpit/issues/268)
* **frontend:** Import bus - If click btn clear, remove error msg ([d8bf44b](https://gitlab.com/linagora/petals-cockpit/commit/d8bf44b)), closes [#296](https://gitlab.com/linagora/petals-cockpit/issues/296)
* **frontend:** use material buttons for SU/Comp state change ([07569fa](https://gitlab.com/linagora/petals-cockpit/commit/07569fa)), closes [#283](https://gitlab.com/linagora/petals-cockpit/issues/283)
* **product:** broadcast new import in progress via SSE ([4d08764](https://gitlab.com/linagora/petals-cockpit/commit/4d08764)), closes [#250](https://gitlab.com/linagora/petals-cockpit/issues/250)
* **frontend:** Ability to start component if loaded ([eebbba5](https://gitlab.com/linagora/petals-cockpit/commit/eebbba5))


### Features

* **backend:** workspace deletion API ([42ea32b](https://gitlab.com/linagora/petals-cockpit/commit/42ea32b)), closes [#240](https://gitlab.com/linagora/petals-cockpit/issues/240)
* **frontend:** add menu with current username & logout ([35db654](https://gitlab.com/linagora/petals-cockpit/commit/35db654)), closes [#243](https://gitlab.com/linagora/petals-cockpit/issues/243)
* **frontend:** autofocus only in non-mobile screens ([fb8a93f](https://gitlab.com/linagora/petals-cockpit/commit/fb8a93f))
* **frontend:** ensure notifications are removed on workspace close ([499c8c4](https://gitlab.com/linagora/petals-cockpit/commit/499c8c4)), closes [#286](https://gitlab.com/linagora/petals-cockpit/issues/286)
* **frontend:** redirected to original url after login ([436aaff](https://gitlab.com/linagora/petals-cockpit/commit/436aaff)), closes [#261](https://gitlab.com/linagora/petals-cockpit/issues/261)
* **frontend:** show a notification on bus deleted ([7dc8fd9](https://gitlab.com/linagora/petals-cockpit/commit/7dc8fd9))
* **frontend:** the workspace list is now closeable in a workspace ([2a6a41b](https://gitlab.com/linagora/petals-cockpit/commit/2a6a41b)), closes [#258](https://gitlab.com/linagora/petals-cockpit/issues/258)
* **frontend:** workspace deletion ([3f02744](https://gitlab.com/linagora/petals-cockpit/commit/3f02744)), closes [#241](https://gitlab.com/linagora/petals-cockpit/issues/241)
* **product:** allow to cancel buses in progress ([3fb5cac](https://gitlab.com/linagora/petals-cockpit/commit/3fb5cac)), closes [#123](https://gitlab.com/linagora/petals-cockpit/issues/123)


### Performance Improvements

* **frontend:** ensure subscriptions are closed when needed ([cc7f737](https://gitlab.com/linagora/petals-cockpit/commit/cc7f737))
* **frontend:** preload javascript ([98c4bd5](https://gitlab.com/linagora/petals-cockpit/commit/98c4bd5)), closes [#179](https://gitlab.com/linagora/petals-cockpit/issues/179)



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

