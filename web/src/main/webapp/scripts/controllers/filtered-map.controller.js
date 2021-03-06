(function() {
	'use strict';
	
	pinpointApp.controller('FilteredMapCtrl', [ 'filterConfig', '$scope', '$routeParams', '$timeout', 'TimeSliderVo', 'NavbarVo', 'encodeURIComponentFilter', '$window', 'SidebarTitleVo', 'filteredMapUtil', '$rootElement',
	    function (cfg, $scope, $routeParams, $timeout, TimeSliderVo, NavbarVo, encodeURIComponentFilter, $window, SidebarTitleVo, filteredMapUtil, $rootElement) {
			$at($at.FILTEREDMAP_PAGE);
	        // define private variables
	        var oNavbarVo, oTimeSliderVo, bNodeSelected, bNoData, reloadOnlyForNode, reloadOnlyForLink;
	
	        // define private variables of methods
	        var openFilteredMapWithFilterVo, broadcastScatterScanResultToScatter;
	
	        // initialize scope variables
	        $scope.hasScatter = false;
	        $window.htoScatter = {};
	        bNoData = true;
	        reloadOnlyForNode = false;
	        reloadOnlyForLink = false;
	        $scope.sidebarLoading = false;
	
	        /**
	         * initialize
	         */
	        $timeout(function () {
	            oNavbarVo = new NavbarVo();
	            if ($routeParams.application) {
	                oNavbarVo.setApplication($routeParams.application);
	            }
	            if ($routeParams.readablePeriod) {
	                oNavbarVo.setReadablePeriod($routeParams.readablePeriod);
	            }
	            if ($routeParams.queryEndDateTime) {
	                oNavbarVo.setQueryEndDateTime($routeParams.queryEndDateTime);
	            }
	            if ($routeParams.filter) {
	                oNavbarVo.setFilter($routeParams.filter);
	            }
	            if ($routeParams.hint) {
	                oNavbarVo.setHint($routeParams.hint);
	            }
	            $window.$routeParams = $routeParams;
	            oNavbarVo.autoCalculateByQueryEndDateTimeAndReadablePeriod();
	
	            oTimeSliderVo = new TimeSliderVo()
	                .setFrom(oNavbarVo.getQueryStartTime())
	                .setTo(oNavbarVo.getQueryEndTime())
	                .setInnerFrom(oNavbarVo.getQueryEndTime() - 1)
	                .setInnerTo(oNavbarVo.getQueryEndTime());
	
	            $timeout(function () {
	                $scope.$broadcast('timeSlider.initialize', oTimeSliderVo);
	                $scope.$broadcast('serverMap.initialize', oNavbarVo);
	                $scope.$broadcast('scatter.initialize', oNavbarVo);
	            });
	
	        }, 500);
	
	        /**
	         * open filtered map with filterVo
	         * @param filterDataSet
	         * @param filterTargetRpcList
	         */
	        openFilteredMapWithFilterVo = function (oServerMapFilterVo, filterTargetRpcList) {
	            var url = filteredMapUtil.getFilteredMapUrlWithFilterVo(oNavbarVo, oServerMapFilterVo, filterTargetRpcList);
	            $window.open(url, "");
	        };
	
	        /**
	         * broadcast scatter scan result to scatter
	         * @param applicationScatterScanResult
	         */
	        broadcastScatterScanResultToScatter = function (applicationScatterScanResult) {
	            if (angular.isDefined(applicationScatterScanResult)) {
	                angular.forEach(applicationScatterScanResult, function (val, key) {
	                    $scope.$broadcast('scatter.initializeWithData', key, val);
	                });
	            }
	        };
	
	        /**
	         * get main container class
	         */
	        $scope.getMainContainerClass = function () {
	            return bNoData ? 'no-data' : '';
	        };
	
	        /**
	         * get info details class
	         * @returns {string}
	         */
	        $scope.getInfoDetailsClass = function () {
	            var infoDetailsClass = [];
	
	            if ($scope.hasScatter) {
	                infoDetailsClass.push('has-scatter');
	            }
	            if ($scope.hasFilter) {
	                infoDetailsClass.push('has-filter');
	            }
	
	            return infoDetailsClass.join(' ');
	        };
	
	        /**
	         * scope event on servermap.hasData
	         */
	        $scope.$on('servermap.hasData', function (event) {
	            bNoData = false;
	            $scope.sidebarLoading = false;
	        });
	
	        /**
	         * scope event on servermap.hasNoData
	         */
	        $scope.$on('servermap.hasNoData', function (event) {
	            bNoData = true;
	            $scope.sidebarLoading = false;
	        });
	
	        /**
	         * scope event on serverMap.fetched
	         */
	        $scope.$on('serverMap.fetched', function (event, lastFetchedTimestamp, mapData) {
	            oTimeSliderVo.setInnerFrom(lastFetchedTimestamp);
	            reloadOnlyForNode = true;
	            reloadOnlyForLink = true;
	            $scope.$broadcast('timeSlider.setInnerFromTo', oTimeSliderVo);
	            broadcastScatterScanResultToScatter(mapData.applicationScatterScanResult);
	
	            // auto trying fetch
	            if (mapData.applicationMapData.nodeDataArray.length === 0 && mapData.applicationMapData.linkDataArray.length === 0) {
	                $timeout(function () {
	                    $scope.$broadcast('timeSlider.moreClicked');
	                }, 500);
	            } else {
	                $scope.$broadcast('timeSlider.enableMore');
	            }
	        });
	
	        /**
	         * scope event on serverMap. allFetched
	         */
	        $scope.$on('serverMap.allFetched', function (event, mapData) {
	            oTimeSliderVo.setInnerFrom(oTimeSliderVo.getFrom());
	            reloadOnlyForNode = true;
	            reloadOnlyForLink = true;
	            $scope.$broadcast('timeSlider.setInnerFromTo', oTimeSliderVo);
	            $scope.$broadcast('timeSlider.changeMoreToDone');
	            $scope.$broadcast('timeSlider.disableMore');
	
	            broadcastScatterScanResultToScatter(mapData.applicationScatterScanResult);
	        });
	
	        /**
	         * scope event of timeSlider.moreClicked
	         */
	        $scope.$on('timeSlider.moreClicked', function (event) {
	            var newNavbarVo = new NavbarVo();
	            newNavbarVo
	                .setApplication(oNavbarVo.getApplication())
	                .setQueryStartTime(oNavbarVo.getQueryStartTime())
	                .setQueryEndTime(oTimeSliderVo.getInnerFrom())
	                .autoCalcultateByQueryStartTimeAndQueryEndTime();
	            $scope.sidebarLoading = true;
	            $scope.$broadcast('timeSlider.disableMore');
	            $scope.$broadcast('serverMap.fetch', newNavbarVo.getQueryPeriod(), newNavbarVo.getQueryEndTime());
	        });
	
	        /**
	         * scope event on serverMap.passingTransactionResponseToScatterChart
	         */
	//        $scope.$on('serverMap.passingTransactionResponseToScatterChart', function (event, node) {
	//            $scope.$broadcast('scatter.initializeWithData', node);
	//        });
	
	        /**
	         * scope event on serverMap.nodeClicked
	         */
	        $scope.$on('serverMap.nodeClicked', function (event, e, query, node, data) {
	            bNodeSelected = true;
	            var oSidebarTitleVo = new SidebarTitleVo;
	            oSidebarTitleVo.setImageType(node.serviceType);
	
	            if (node.isWas === true) {
	                $scope.hasScatter = true;
	                oSidebarTitleVo.setTitle(node.applicationName);
	                $scope.$broadcast('scatter.showByNode', node);
	            } else if (node.unknownNodeGroup) {
	            	oSidebarTitleVo.setTitle( node.serviceType.replace( "_", " " ) );
	                $scope.hasScatter = false;
	            } else {
	                oSidebarTitleVo.setTitle(node.applicationName);
	                $scope.hasScatter = false;
	            }
	            $scope.hasFilter = false;
	            $scope.$broadcast('sidebarTitle.initialize.forFilteredMap', oSidebarTitleVo);
	            $scope.$broadcast('nodeInfoDetails.initialize', e, query, node, data, oNavbarVo, reloadOnlyForNode);
	            $scope.$broadcast('linkInfoDetails.hide', e, query, node, data, oNavbarVo);
	            reloadOnlyForNode = false;
	        });
	
	        /**
	         * scope event on serverMap.linkClicked
	         */
	        $scope.$on('serverMap.linkClicked', function (event, e, query, link, data) {
	            bNodeSelected = false;
	            var oSidebarTitleVo = new SidebarTitleVo;
	            if (link.unknownLinkGroup) {
	                oSidebarTitleVo
	                    .setImageType(link.sourceInfo.serviceType)
	                    .setTitle('Unknown Group from ' + link.sourceInfo.applicationName);
	            } else {
	                oSidebarTitleVo
	                    .setImageType(link.sourceInfo.serviceType)
	                    .setTitle(link.sourceInfo.applicationName)
	                    .setImageType2(link.targetInfo.serviceType)
	                    .setTitle2(link.targetInfo.applicationName);
	            }
	            $scope.hasScatter = false;
	            var foundFilter = filteredMapUtil.findFilterInNavbarVo(
	                link.sourceInfo.applicationName,
	                link.sourceInfo.serviceType,
	                link.targetInfo.applicationName,
	                link.targetInfo.serviceType,
	                oNavbarVo
	            );
	            if (foundFilter) {
	                $scope.hasFilter = true;
	                $scope.$broadcast('filterInformation.initialize.forFilteredMap', foundFilter.oServerMapFilterVo);
	            } else {
	                $scope.hasFilter = false;
	            }
	            $scope.$broadcast('sidebarTitle.initialize.forFilteredMap', oSidebarTitleVo);
	            $scope.$broadcast('nodeInfoDetails.hide');
	            $scope.$broadcast('linkInfoDetails.initialize', e, query, link, data, oNavbarVo, reloadOnlyForLink);
	            reloadOnlyForLink = false;
	        });
	
	
	        /**
	         * scope event on serverMap.openFilteredMap
	         */
	        $scope.$on('serverMap.openFilteredMap', function (event, oServerMapFilterVo, filterTargetRpcList) {
	            openFilteredMapWithFilterVo(oServerMapFilterVo, filterTargetRpcList);
	        });
	
	        /**
	         * scope event on serverMap.openFilteredMap
	         */
	        $scope.$on('linkInfoDetails.openFilteredMap', function (event, oServerMapFilterVo, filterTargetRpcList) {
	            openFilteredMapWithFilterVo(oServerMapFilterVo, filterTargetRpcList);
	        });
	
	        /**
	         * scope event on linkInfoDetails.openFilterWizard
	         */
	        $scope.$on('linkInfoDetails.openFilterWizard', function (event, oServerMapFilterVo, oServerMapHintVo) {
	            $scope.$broadcast('serverMap.openFilterWizard', oServerMapFilterVo, oServerMapHintVo);
	        });
	
	        /**
	         * scope event on linkInfoDetails.ResponseSummary.barClicked
	         */
	        $scope.$on('linkInfoDetails.ResponseSummary.barClicked', function (event, oServerMapFilterVo, filterTargetRpcList) {
	            openFilteredMapWithFilterVo(oServerMapFilterVo, filterTargetRpcList);
	        });
	
	        /**
	         * scope event on linkInfoDetail.showDetailInformationClicked
	         */
	        $scope.$on('linkInfoDetail.showDetailInformationClicked', function (event, query, link) {
	            $scope.hasScatter = false;
	            var oSidebarTitleVo = new SidebarTitleVo;
	            oSidebarTitleVo
	                .setImageType(link.sourceInfo.serviceType)
	                .setTitle(link.sourceInfo.applicationName)
	                .setImageType2(link.targetInfo.serviceType)
	                .setTitle2(link.targetInfo.applicationName);
	            $scope.$broadcast('sidebarTitle.initialize.forFilteredMap', oSidebarTitleVo);
	            $scope.$broadcast('nodeInfoDetails.hide');
	        });
	
	        /**
	         * scope event on nodeInfoDetail.showDetailInformationClicked
	         */
	        $scope.$on('nodeInfoDetail.showDetailInformationClicked', function (event, query, node) {
	            $scope.hasScatter = false;
	            var oSidebarTitleVo = new SidebarTitleVo;
	            oSidebarTitleVo
	                .setImageType(node.serviceType)
	                .setTitle(node.applicationName);
	            $scope.$broadcast('sidebarTitle.initialize.forMain', oSidebarTitleVo);
	            $scope.$broadcast('linkInfoDetails.hide');
	        });
	    }
	]);
})();