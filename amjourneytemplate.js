/* AM Journey Template
 * 
 * This is a default template with examples to give you a jump start
 * 
 * Make sure to delete 
 * 
 * The Scripted Decision Node needs the following outcomes defined:
 * - one
 * - multiple
 * - none
 *
 * Author: volker.scheuber@forgerock.com
 */
(function () {
    logger.message("IDP Lookup: start");
  	outcome = "none";
  	var username = sharedState.get("username");
  	var domain = username.substr(username.lastIndexOf("@")+1);
  	var referer = parseUrl(requestHeaders.get("referer").get(0));

  	/* Begin Configuration */
  
    // long-lived token, expires: Monday, October 13, 2031 1:12:39 AM GMT
    var IDM_API_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmNjhkZjgzYi1lZTA4LTRlOTAtYjQ0NC0yZWUxMGQ5MjJmMDYiLCJjdHMiOiJPQVVUSDJfU1RBVEVMRVNTX0dSQU5UIiwiYXV0aF9sZXZlbCI6MCwiYXVkaXRUcmFja2luZ0lkIjoiZjM1ZjQ1OTQtYWNkZS00Mjg4LWE0YWItZTQ5ZTljMjBmZGIxLTEyMTk3OTciLCJzdWJuYW1lIjoiZjY4ZGY4M2ItZWUwOC00ZTkwLWI0NDQtMmVlMTBkOTIyZjA2IiwiaXNzIjoiaHR0cHM6Ly9vcGVuYW0tYnJvYWRjb20tcGVyZi5mb3JnZWJsb2Nrcy5jb206NDQzL2FtL29hdXRoMi9hbHBoYSIsInRva2VuTmFtZSI6ImFjY2Vzc190b2tlbiIsInRva2VuX3R5cGUiOiJCZWFyZXIiLCJhdXRoR3JhbnRJZCI6IjdmZHlfcnMxUkFWX2tSdzFuRmlFZklkNTVHVSIsImF1ZCI6ImY2OGRmODNiLWVlMDgtNGU5MC1iNDQ0LTJlZTEwZDkyMmYwNiIsIm5iZiI6MTYzNDI2MDM1OSwiZ3JhbnRfdHlwZSI6InBhc3N3b3JkIiwic2NvcGUiOlsiZnI6aWRtOioiXSwiYXV0aF90aW1lIjoxNjM0MjYwMzU5LCJyZWFsbSI6Ii9hbHBoYSIsImV4cCI6MTk0OTYyMDM1OSwiaWF0IjoxNjM0MjYwMzU5LCJleHBpcmVzX2luIjozMTUzNjAwMDAsImp0aSI6Ik5xcGJIUlZBSWlDSTBXMVRhYjVKZ21UdFJyWSJ9.AUwvj6kRvRMnBw4IglFq-6a6iLPYKp-HV_MV_BCzvWM";

    // IDM API Configuration
    var IDM_API_URI = referer.origin + "/openidm/managed/alpha_organization?_queryFilter=idpDomains+co+'" + domain + "'&_fields=name,description,idpName,idpType,idpDomains,idpJourney,idpTheme,idpMFA,idpMFAType,idpPersist,idpApps,idpSAMLConfig";

  	/* End Configuration */

    var request = new org.forgerock.http.protocol.Request();
    request.setMethod('GET');
    request.setUri(IDM_API_URI);
	request.getHeaders().add("Content-Type", "application/json; charset=UTF-8");
	request.getHeaders().add("Authorization", "Bearer " + IDM_API_TOKEN);

    var response = httpClient.send(request).get();
    var result = JSON.parse(response.getEntity().getString());
    logger.message("IDP Lookup: JSON result: " + JSON.stringify(result));
	
  	var routedIDPs = result.result.length ? result.result : [{}];
  	// store apps as a pipe-delimited string so they can be stored in session props later on
  	if (routedIDPs[0].idpApps) {
  		routedIDPs[0]["idpApps"] = routedIDPs[0].idpApps.join('|');
    }
  	sharedState.put("routedIDPs", routedIDPs);
	if (result.resultCount === 1) {
    	logger.message("IDP Lookup: Found exactly 1 IDP");
        outcome = "one";
    }
  	else if (result.resultCount > 1) {
    	logger.message("IDP Lookup: Found {} IDPs", result.resultCount);
        outcome = "multiple";
    }
  	else {
    	logger.message("IDP Lookup: Found no IDPs");
    }
    logger.message("IDP Lookup: end [outcome={}]", outcome);

    /*
     * Parse a URL into its components and make them easily accessible by name
     *
     * Use in a Scripte Decision Node Script as follows:
     * var referer = parseUrl(requestHeaders.get("referer").get(0));
     * var origin = referer.origin;
     * 
     * e.g.: https://openam-volker-dev.forgeblocks.com/am/XUI/?realm=/bravo&authIndexType=service&authIndexValue=InitiateOwnerClaim#/
     * {
     *     hash: '#/',
     *     host: 'openam-volker-dev.forgeblocks.com',
     *     hostname: 'openam-volker-dev.forgeblocks.com',
     *     href: 'https://openam-volker-dev.forgeblocks.com/am/XUI/?realm=/bravo&authIndexType=service&authIndexValue=InitiateOwnerClaim#/',
     *     origin: 'https://openam-volker-dev.forgeblocks.com',
     *     pathname: '/am/XUI/',
     *     port: '',
     *     protocol: 'https',
     *     search: '?realm=/bravo&authIndexType=service&authIndexValue=InitiateOwnerClaim',
     *     username: '',
     *     password: '',
     *     searchParam: {
     *         realm: '/bravo',
     *         authIndexType: 'service',
     *         authIndexValue: 'InitiateOwnerClaim'
     *     }
     * }
     */
    function parseUrl(href) {
        var m = href.match(/^(([^:\/?#]+):?(?:\/\/((?:([^\/?#:]*):([^\/?#:]*)@)?([^\/?#:]*)(?::([^\/?#:]*))?)))?([^?#]*)(\?[^#]*)?(#.*)?$/),
        r = {
            hash: m[10] || "",                      // #/
            host: m[3] || "",                       // openam-volker-dev.forgeblocks.com
            hostname: m[6] || "",                   // openam-volker-dev.forgeblocks.com
            href: m[0] || "",                       // https://openam-volker-dev.forgeblocks.com/am/XUI/?realm=/bravo&authIndexType=service&authIndexValue=InitiateOwnerClaim#/
            origin: m[1] || "",                     // https://openam-volker-dev.forgeblocks.com
            pathname: m[8] || (m[1] ? "/" : ""),    // /am/XUI/
            port: m[7] || "",                       // 
            protocol: m[2] || "",                   // https
            search: m[9] || "",                     // ?realm=/bravo&authIndexType=service&authIndexValue=InitiateOwnerClaim
            username: m[4] || "",                   // 
            password: m[5] || "",                   // 
            searchParam: {}                         // { realm: '/bravo',
                                                    //   authIndexType: 'service',
                                                    //   authIndexValue: 'InitiateOwnerClaim' }
        };
        if (r.protocol.length == 2) {
            r.protocol = "file:///" + r.protocol.toUpperCase();
            r.origin = r.protocol + "//" + r.host;
        }
        if (r.search.length > 2) {
            var query = (r.search.indexOf('?') === 0) ? r.search.substr(1) : r.search;
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            r.searchParam[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
            }
        }
        r.href = r.origin + r.pathname + r.search + r.hash;
        return r;
    };
}());
