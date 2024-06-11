This is a Legacy script. Not A Next Generation Script. 
If using on-prem you need to whitelist this class java.util.LinkedHashMap$* in the following location => https://FQDN:8443/am/ui-admin/#configure/globalServices/scripting/contexts/edit/AUTHENTICATION_TREE_DECISION_NODE/engineConfiguration/edit/engineConfiguration

This script shows a default template on how your Scripting Decision Node scripts should be written.
It shows you how to work with sharedState, transientState, secureState.
This is a great debug script to use in and of itself as it will display all three states mentioned above in a formatted table 
 
This script needs to be parametrized. It will not work properly as is. 
It requires some nodes that set at least sharedState before it can operate.
For example, set a page node with Platform Username and Platform Password nodes

The end goal is that this would inspire a better default template from OOTB journey scripted decision node current template.