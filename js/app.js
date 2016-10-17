if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };
}

var old_linum = 1;
// add line number with textarea growing
function set_linum() {
    new_linum = $('#editor').height() / 15;// how many lines
    $('#linum').height($('#editor').height());
    for(i = old_linum;i < new_linum; i++){
        $('#linum').append(i+'</br>');
    }
    old_linum = new_linum;
}

function draw_flow_chat() {
    //flow-chat support
    $('.lang-flow').each(function(i, block) {
        console.log(block);
        code = $(this).text();
        diagram = flowchart.parse(code);
        canvas_id = 'flow'+ i;
        console.log(canvas_id);
        temp = "<div id='{0}'> </div>".format(canvas_id);
        console.log(temp);
        $(this).html(temp);
        diagram.drawSVG(canvas_id);	
    });
}

function re_render () {
    var md_content = $('#editor').val();
    html_content = marked(md_content);
    $('#preview').html(html_content);
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
};

function restore() {
    if (localStorage) {
        backup = localStorage.getItem("backup");
        $('#editor').val(backup);
        re_render();
    }
}

function saveFile() {
	var md_content = $('#editor').val();
    var file = new File([md_content], "tmp.md",  {type: "text/plain;charset=utf-8"});
	saveAs(file);
}

$(document).ready(function(){
    set_linum();
    is_grow = false;
    $(document).on('keyup', 'textarea', function(e) {
        //  the following will help the text expand as typing takes place
        while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
            $(this).height($(this).height()+1);
            console.log($(this).height());
            console.log($('#editor').height());
            is_grow = true;
        };
        if (is_grow) {
            set_linum();
            is_grow = false;
        }
    });

    function finish_typing () {
        re_render();
        draw_flow_chat();
        // save content
        localStorage.setItem("backup",  $('#editor').val());
    }
    
    //setup before functions
    var typingTimer;                //timer identifier
    var doneTypingInterval = 1000;  //time in ms
    var $input = $('#editor');

    //on keyup, start the countdown
    $input.on('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(finish_typing, doneTypingInterval);
    });

    //on keydown, clear the countdown 
    $input.on('keydown', function () {
        clearTimeout(typingTimer);
    });
    
    // hook keys
    $('#editor').on('keydown', function(e) {
        var keyCode = e.keyCode || e.which;
        // hook TAB key
        if (keyCode == 9) {
            e.preventDefault();
            var start = $(this).get(0).selectionStart;
            var end = $(this).get(0).selectionEnd;

            // insert 4 spaces instead
            $(this).val($(this).val().substring(0, start)
                        + '    '
						+ $(this).val().substring(end));

            // put caret at right position again
            $(this).get(0).selectionStart =
                $(this).get(0).selectionEnd = start + 4;
        }
    });
});
