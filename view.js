// ---- Define your dialogs  and panels here ----
let effective_permissions_panel = define_new_effective_permissions("permissions_panel", true);
$('#sidepanel').append(effective_permissions_panel);
$('#permissions_panel').attr('filepath', '/C');

let user_select_field = define_new_user_select_field("user_select", "Select User", 
    function(selected_user) { 
        $('#permissions_panel').attr('username', selected_user);
});
$('#sidepanel').append(user_select_field);

let dialog = define_new_dialog("dialog", "Permission Information");
$('.perm_info').click(function(){
    dialog.dialog("open");
    dialog.empty();

    let file_path = $('#permissions_panel').attr('filepath');
    let username = $('#permissions_panel').attr('username'); 
    let permission_name = this.getAttribute('permission_name');

    let allowed = allow_user_action(path_to_file[file_path], all_users[username], permission_name, true);

    let permission_append_title = document.createElement('b')
    permission_append_title.append("Permission Name: ")
    let permission_append_name = document.createElement('p')
    permission_append_name.append(permission_name)

    let allowed_append_title = document.createElement('b')
    allowed_append_title.append("Access Allowed: ")
    let allowed_append_name = document.createElement('p')
    allowed_append_name.append(allowed.is_allowed)

    dialog.append(permission_append_title, permission_append_name);
    dialog.append(allowed_append_title, allowed_append_name);
    //if text explanation is null it errors
    if(allowed.text_explanation){
        let allowed_text = get_explanation_text(allowed)
        let explanation_append_title = document.createElement('b')
        explanation_append_title.append("Explanation: ")
        let explanation_append_name = document.createElement('p')
        explanation_append_name.append(allowed_text)
        dialog.append(explanation_append_title, explanation_append_name)
    }
})


// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 