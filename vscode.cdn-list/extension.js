// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var cdns;

function OpenConfig(){
    var path = vscode.extensions.getExtension('AryanMann.cdn-list').extensionPath + '\\CDNs.json';
    require('child_process').exec('start "" "' + path + '"');
}

function activate(context) {    

    //Select a CDN from CDNs.json file
    var disposable = vscode.commands.registerCommand('extension.ListCDNs', function () {
        
        try {
            cdns = require('./CDNs.json');
        } catch (err) { 
            vscode.window.showErrorMessage("Invalid JSON.", {
                "title":"Open CDN List",
            }).then(function(suc){
                if(suc == "undefined" || suc == null){ return; }
                if(suc.title == "Open CDN List"){
                    OpenConfig();
                }
            });
            return;
        }

        var cdnChoices = [];
        for(var i=0; i < cdns.length; i++){
            cdnChoices.push(cdns[i].name + ' ' + cdns[i].version + ' (' + cdns[i].lang + ')');
        }
        
        vscode.window.showQuickPick(cdnChoices).then(function(res){
            if(res == null || res == "undefined"){ return; }
            var choice;

            for(var i=0; i < cdns.length; i++){
                if((cdns[i].name + ' ' + cdns[i].version + ' (' + cdns[i].lang + ')') == res){
                    choice = cdns[i];
                    break;
                }
            }

            if(choice == null){ return; }
            var editor = vscode.window.activeTextEditor;
            if(editor == null || editor == "undefined"){ return; }

            var toInsert = '<!-- ' + choice.name + ' ' + choice.lang + ' ' + choice.version + ' -->\n'
            if(choice.lang == "JS"){
                toInsert += '<script src="' + choice.url + '"></script>';
            } else if(choice.lang == "CSS"){
                toInsert += '<link rel="stylesheet" href="' + choice.url + '" >';
            } else {
                toInsert = choice.url;
            }
  
            editor.edit(function(eb){
                eb.insert(editor.selection.active, toInsert);
            });

        });

    });

    var disposable2 = vscode.commands.registerCommand('extension.Configure', function(){
        OpenConfig();
    })

    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
}

exports.activate = activate;
function deactivate() {

}
exports.deactivate = deactivate;