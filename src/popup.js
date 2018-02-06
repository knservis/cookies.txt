// See http://www.cookiecentral.com/faq/#3.5

if (document.currentScript.getAttribute("from_menu") == "true") {
  chrome.tabs.getSelected(null, function(tab) {

    chrome.cookies.getAll({}, function(cookies) {
      message = getMessage(tab.url, cookies)
      document.write("<pre>\n"+ message + "</pre>");
    });
  })
}
else {
  // Assuming context menu call here
  chrome.contextMenus.create({
    title: "cUrly link",
    contexts: ["link"],
    onclick: showLink
  });
}

function showLink(info, tab) {
  var link = info['linkUrl']
    chrome.cookies.getAll({}, function(cookies) {
      message = getMessage(link, cookies)
      // document.write("<pre>\n"+ message + "</pre>");
      var sandbox = document.getElementById('sandbox');
      sandbox.value = message;
      sandbox.select();
      document.execCommand("copy")
      console.log(message);
      sandbox.value = '';
    });
}

function getMessage(url, cookies) {
  var domain = getDomain(url)
  var cookies_kv = "";
  var command = "";
  var popup = "";
    for (var i in cookies) {
      cookie = cookies[i];
      if (cookie.domain.indexOf(domain) != -1) {
        cookies_kv += escapeForPre(cookie.name);
        cookies_kv += "=";
        cookies_kv += escapeForPre(cookie.value);
        cookies_kv += "; ";
      }
    }
    command += "curl -L -O --cookie \"" + cookies_kv + "\" " + escapeForPre(url) ;
    return command;
}

function escapeForPre(text) {
  return String(text).replace(/&/g, "&amp;")
                     .replace(/</g, "&lt;")
                     .replace(/>/g, "&gt;")
                     .replace(/"/g, "&quot;")
                     .replace(/'/g, "&#039;");
}

function getDomain(url) {
  server = url.match(/:\/\/(.[^/:#?]+)/)[1];
  parts = server.split(".");
  isip = !isNaN(parseInt(server.replace(".",""),10));

  if (parts.length <= 1 || isip)   {
    domain = server;
  }
  else   {
    //search second level domain suffixes
    var domains = new Array();
    domains[0] = parts[parts.length-1];
    for(i=1;i<parts.length;i++)     {
      domains[i] = parts[parts.length-i-1] + "." + domains[i-1];
      //domainlist defines in domain_list.js 
      if (!domainlist.hasOwnProperty(domains[i])) {
        domain = domains[i];
        break;
      }
    }

    if (typeof(domain) == "undefined") { 
      domain = server;
    }
  }
  return domain;
}
