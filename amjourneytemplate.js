/* AM Journey Template
 *
 * Authors: se@forgerock.com
 * 
 * Description of the script goes here
 * 
 * This script needs to be parametrized. It will not work properly as is. 
 * It requires some nodes that set at least sharedState before it can operate.
 * For example, set a page node with Platform Username and Platform Password nodes
 * 
 * The Scripted Decision Node needs the following outcomes defined:
 * - true
 */

// Do everything in a self-invoking function and do not write code outside of a function or you will pay dearly. 
// This is because of top-level scoping/whitelisting/etc issues that give you 'undefined' errors.
(function () {
  logger.message("Script: start"); // beging of script main
  outcome = "true"; // <- fill in default outcome here and it should match a "Script Outcomes" setting on this node itself

  // build output html table that will be sent back to browser
  var output = createHtml();

  // issue callback to browser after output html is built from createHtml() function
  displayMessage(output);
  
  logger.message("Script: end"); // end of script main

  /*
  * Put functions below here
  */
  function createHtml() {
      var html = "<table>";
      html += "<tr><td colspan=\"2\"><u><b>Shared State Variables<b><u></td></tr>";
      // get all the keys in nodeState
      var iterator = nodeState.keys().iterator();
      var stateKeys = [];
      while (iterator.hasNext()) {
          stateKeys.push(iterator.next().toString());
      }
      stateKeys.forEach(function (stateKey) {
        if (sharedState.get(stateKey) 
            && sharedState.get(stateKey).toString() !== "null"
            && sharedState.get(stateKey).toString() !== ""
            && ""+stateKey !== "objectAttributes"
            && ""+stateKey !== "pageNodeCallbacks") //pageNodeCallbacks are internal to the Page Node and not needed/used  
        {
          html += "<tr><td>" + stateKey + "</td><td>" + sharedState.get(stateKey) + "</td></tr>";
        }
      });
    
      html += "<tr><td colspan=\"2\"><br></td></tr>";
      html += "<tr><td colspan=\"2\"><u><b>Transient State Variables<b></u></td></tr>";
      // get all the keys in nodeState
      var iterator = nodeState.keys().iterator();
      var stateKeys = [];
      while (iterator.hasNext()) {
          stateKeys.push(iterator.next().toString());
      }
      stateKeys.forEach(function (stateKey) {
        if (transientState.get(stateKey) 
            && transientState.get(stateKey).toString() !== "null" 
            && transientState.get(stateKey).toString() !== ""
            && ""+stateKey !== "objectAttributes") 
        {
          html += "<tr><td>" + stateKey + "</td><td>" + transientState.get(stateKey) + "</td></tr>";
        }
      });
          
      // Build the rows of objectAttributes in sharedState
      if (sharedState.get("objectAttributes"))
      {
    
        html += "<tr><td colspan=\"2\"><br></td></tr>";
        html += "<tr><td colspan=\"2\"><u><b>Shared Object Attributes<b></u></td></tr>";
        var entries = sharedState.get('objectAttributes').entrySet().toArray();
        entries.forEach(function (entry) { // showing how to use entrySet(). Can use keySet().
            html += "<tr><td>" + entry.getKey() + "</td><td>" + entry.getValue() + "</td></tr>";
        });
      }
      else {
        html += "<tr><td colspan=\"2\">EMPTY</td></tr>";
      }

      // Build the rows of objectAttributes in transientState
      if (transientState.get("objectAttributes"))
      {
        html += "<tr><td colspan=\"2\"><br></td></tr>";
        html += "<tr><td colspan=\"2\"><u><b>Transient Object Attributes<b></u></td></tr>";
        var keys = transientState.get('objectAttributes').keySet().toArray();
        keys.forEach(function (key) { // showing how to use keySet(). Can use entrySet().
            html += "<tr><td>" + key + "</td><td>" + transientState.get('objectAttributes').get(key) + "</td></tr>";
        });
      }
      else {
        html += "<tr><td colspan=\"2\">EMPTY</td></tr>";
      }
      
      // looking for a way to build this AM User Profile list dynamically
      var objAMAttrs = [
        "uid",
        "cn",
        "inetUserStatus",
        "givenName",
        "sn",
        "mail",
        "description",
        "telephoneNumber",
        "street",
        "l",
        "postalCode",
        "co",
        "st",
        "displayName",
        "fr-attr-istr1",
        "fr-attr-istr2",
        "fr-attr-istr3",
        "fr-attr-istr4",
        "fr-attr-istr5",
        "fr-attr-str1",
        "fr-attr-str2",
        "fr-attr-str3",
        "fr-attr-str4",
        "fr-attr-str5",
        "fr-attr-imulti1",
        "fr-attr-imulti2",
        "fr-attr-imulti3",
        "fr-attr-imulti4",
        "fr-attr-imulti5",
        "fr-attr-multi1",
        "fr-attr-multi2",
        "fr-attr-multi3",
        "fr-attr-multi4",
        "fr-attr-multi5",
        "fr-attr-idate1",
        "fr-attr-idate2",
        "fr-attr-idate3",
        "fr-attr-idate4",
        "fr-attr-idate5",
        "fr-attr-date1",
        "fr-attr-date2",
        "fr-attr-date3",
        "fr-attr-date4",
        "fr-attr-date5",
        "fr-attr-iint1",
        "fr-attr-iint2",
        "fr-attr-iint3",
        "fr-attr-iint4",
        "fr-attr-iint5",
        "fr-attr-int1",
        "fr-attr-int2",
        "fr-attr-int3",
        "fr-attr-int4",
        "fr-attr-int5"
      ];  

      // Build the rows of idRepository binding
      var attrs2;
      if (sharedState.get("_id") && idRepository.getAttribute(sharedState.get("_id"), "uid"))
      {
        html += "<tr><td colspan=\"2\"><br></td></tr>";
        html += "<tr><td colspan=\"2\"><u><b>idRepository AM User Profile<b></u></td></tr>";        
        var id = sharedState.get("_id");
        objAMAttrs.forEach(function (attr) {
          attrs = idRepository.getAttribute(id, attr);  
          if (attrs && ""+attrs !== "null" && ""+attrs !== "" && ""+attrs.size()>0){
            if (attrs.size()===1){
            	attrs = singleValue(attrs);
          	}
            html += "<tr><td>" + attr + "</td><td>" + attrs + "</td></tr>";
          }
        });      
      }
    
      //show requestheaders
      // looking for a way to build this header list dynamically
      var headers = [
        "accept",
        "accept-api-version",
        "protocol",
        "resource",
        "accept-encoding",
        "accept-language",
        "content-length",
        "content-type",
        "cookie",
        "host",
        "origin",
        "referer",
        "sec-ch-ua",
        "sec-cha-ua-mobile",
        "sec-ch-ua-platform",
        "sec-fetch-dest",
        "sec-fetch-mode",
        "sec-fetch-site",
        "user-agent",
        "via",
        "x-client-data",
        "x-cloud-trace-context",
        "x-forgerock-transactionid",
        "x-forwarded-for",
        "x-forwarded-proto",
        "x-requested-with"
      ];
    
      html += "<tr><td colspan=\"2\"><br></td></tr>";
      html += "<tr><td colspan=\"2\"><u><b>Request Headers<b></u></td></tr>";
      html += "<tr><td colspan=\"2\">" + requestHeaders.toString() + "</td></tr>";

    
    html += "</table>";
      
    return html;
  }
  
  //builds the html to display the message in the browser on the callback
  //use view source in browser and look for class="callback-component" to see html response
  function displayMessage(message) {
      var anchor = "anchor-".concat(generateNumericToken('xxx'));
      var halign = "left";
      var script = "Array.prototype.slice.call(\n".concat(
          "document.getElementsByClassName('callback-component')).forEach(\n").concat(
              "function (e) {\n").concat(
                  "  var message = e.firstElementChild;\n").concat(
                      "  if (message.firstChild && message.firstChild.nodeName == '#text' && message.firstChild.nodeValue.trim() == '").concat(anchor).concat("') {\n").concat(
                          "    message.className = \"\";\n").concat(
                              "    message.style = \"text-align: left; inline-size: 630px; overflow-wrap: break-word;\";\n").concat(
                                  "    message.align = \"").concat(halign).concat("\";\n").concat(
                                      "    message.innerHTML = '").concat(message).concat("';\n").concat(
                                          "  }\n").concat(
                                              "})")
      var fr = JavaImporter(
          org.forgerock.openam.auth.node.api.Action,
          javax.security.auth.callback.TextOutputCallback,
          com.sun.identity.authentication.callbacks.ScriptTextOutputCallback
      )
      if (message.length && callbacks.isEmpty()) {
          action = fr.Action.send(
              new fr.TextOutputCallback(
                  fr.TextOutputCallback.INFORMATION,
                  anchor
              ),
              new fr.ScriptTextOutputCallback(script)
          ).build()
      }
      else {
          action = fr.Action.goTo(outcome).build();
      }
  }

  /*
   * Generate a token in the desired format. All 'x' characters will be replaced with a random number 0-9.
   * This is needed to have a unique div(anchor-x) on the html callback that we can populate data
   * Example:
   * 'xxxxx' produces '28535'
   * 'xxx-xxx' produces '432-521'
   */
  function generateNumericToken(format) {
      return format.replace(/[x]/g, function (c) {
          var r = Math.random() * 10 | 0;
          var v = r;
          return v.toString(10);
      });
  }

  // get a singleValue from a HashSet
  function singleValue(x)
  {
    if(x.size()>0)
      {
        return x.iterator().next();
      }
      
    return "";
    
  }

}()); // self-invoking function