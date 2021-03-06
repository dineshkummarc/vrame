/*
 * jQuery RTE plugin 0.5.1 - create a rich text form for Mozilla, Opera, Safari and Internet Explorer
 *
 * Copyright (c) 2009 Batiste Bieler
 * Distributed under the GPL Licenses.
 * Distributed under the The MIT License.
 */

// define the rte light plugin
(function($) {
    $.fn.rte = function(options) {

        var defaults = {
            media_url: "",
            content_css_url: "rte.css",
            dot_net_button_class: null,
			min_height: 260,
            max_height: 350
        };

	    // build main options before element iteration
	    var opts = $.extend(defaults, options);
	
	    // iterate and construct the RTEs
        return this.each( function(){
		
            var textarea = $(this);
		    var iframe;
		    var element_id = textarea.attr("id");				
		
		    // enable design mode
		    function enableDesignMode() {
			
			    var content = textarea.val();
			
			    // Mozilla needs this to display caret
	            if($.trim(content)=='') {
	                content = '<br />';
			    }
			
			    // already created? show/hide
			    if(iframe) {
				    textarea.hide();
				    $(iframe).contents().find("body").html(content);  
				    $(iframe).show();
				    $("#toolbar-" + element_id).remove();
	                textarea.before(toolbar());
				    return true;
			    }
			
	            // for compatibility reasons, need to be created this way
	     		iframe = document.createElement("iframe");
	            iframe.frameBorder=0;
	            iframe.frameMargin=0;
	            iframe.framePadding=0;
	            iframe.height=200;
	            if(textarea.attr('class'))
	                iframe.className = textarea.attr('class');
	            if(textarea.attr('id'))
	                iframe.id = element_id;
	            if(textarea.attr('name'))
	                iframe.title = textarea.attr('name');

	            textarea.after(iframe);
	
	            var css = "";
	            if(opts.content_css_url) {
	                css = "<link type='text/css' rel='stylesheet' href='" + opts.content_css_url + "' />";
			    }

	            var doc = "<html><head>"+css+"</head><body class='frameBody'>"+content+"</body></html>";
	            tryEnableDesignMode(doc, function() {
	                $("#toolbar-" + element_id).remove();
	                textarea.before(toolbar());
				    // hide textarea
	                textarea.hide();
					/* Change: Use p als Standard Format Block --molily */
					// ey molily, that was not so nice
					// now all the time the richtext editor will be loaded all the first lines
					// which are usually are <h4> are <p> ;-(
					// so I comment this in... and fix it properly ;-)
					// formatText("formatblock", '<p>')
	            });
			
	        }
	
	        function tryEnableDesignMode(doc, callback) {
			    if(!iframe) { return false; }
			
	            try {
	                iframe.contentWindow.document.open();
	                iframe.contentWindow.document.write(doc);
	                iframe.contentWindow.document.close();
	            } catch(error) {
	                //console.log(error);
	            }
	            if (document.contentEditable) {
	                iframe.contentWindow.document.designMode = "On";
	                callback();
	                return true;
	            }
	            else if (document.designMode != null) {
	                try {
	                    iframe.contentWindow.document.designMode = "on";
	                    callback();
	                    return true;
	                } catch (error) {
	                    //console.log(error);
	                }
	            }
	            setTimeout(function(){tryEnableDesignMode(doc, callback)}, 500);
	            return false;
	        }
	
	        function disableDesignMode(submit) {
	            var content = $(iframe).contents().find("body").html();           
			
			    if($(iframe).is(":visible")) {
				    textarea.val(content);
			    }

	            if(submit != true) {
				    textarea.show();
	                $(iframe).hide();
			    }
	        }
	
		    // create toolbar and bind events to it's elements
	        function toolbar() {
	            var tb = $("<div class='rte-toolbar' id='toolbar-"+ element_id +"'><div>\
	                <p>\
	                    <select>\
	                        <option value=''>Block style</option>\
	                        <option value='p' selected='selected'>Paragraph</option>\
	                        <option value='h3'>Title</option>\
	                        <option value='address'>Address</option>\
	                    </select>\
	                </p>\
	                <p>\
	                    <a href='#' class='bold'><img src='"+opts.media_url+"bold.gif' alt='bold' /></a>\
	                    <a href='#' class='italic'><img src='"+opts.media_url+"italic.gif' alt='italic' /></a>\
	                </p>\
	                <p>\
	                    <a href='#' class='unorderedlist'><img src='"+opts.media_url+"unordered.gif' alt='unordered list' /></a>\
	                    <a href='#' class='link'><img src='"+opts.media_url+"link.png' alt='link' /></a>\
	                    <a href='#' class='image'><img src='"+opts.media_url+"image.png' alt='image' /></a>\
						<a href='#' class='striptags'><img src='"+opts.media_url+"striptags.gif' alt='strip tags' /></a>\
	                    <a href='#' class='disable'><img src='"+opts.media_url+"close.gif' alt='close rte' /></a>\
	                </p></div></div>");
	
	            $('select', tb).change(function(){
	                var index = this.selectedIndex;
	                if( index!=0 ) {
	                    var selected = this.options[index].value;
	                    formatText("formatblock", '<'+selected+'>');
	                }
	            });
	            $('.bold', tb).click(function(){ formatText('bold');return false; });
	            $('.italic', tb).click(function(){ formatText('italic');return false; });
	            $('.unorderedlist', tb).click(function(){ formatText('insertunorderedlist');return false; });
	            $('.link', tb).click(function(){ 
	                var p=prompt("URL:");
	                if(p)
	                    formatText('CreateLink', p);
	                return false; });
	
	            $('.image', tb).click(function(){ 
	                var p=prompt("image URL:");
	                if(p)
	                    formatText('InsertImage', p);
	                return false; });
				$('.striptags', tb).click(function() {
					if(confirm('Do you really want to remove all formating?')) {
						stripTags(iframe);
					}
				});
	            $('.disable', tb).click(function() {
	                disableDesignMode();
	                var edm = $('<a class="rte-edm" href="#">Enable design mode</a>');
				    tb.empty().append(edm);
	                edm.click(function(e){
					    e.preventDefault();
	                    enableDesignMode();
					    // remove, for good measure
					    $(this).remove();
	                });
	                return false; 
	            });

	            // .NET compatability
	            if(opts.dot_net_button_class) {
	                var dot_net_button = $(iframe).parents('form').find(opts.dot_net_button_class);
	                dot_net_button.click(function() {
	                    disableDesignMode(true);
	                });
                // Regular forms
	            } else {        
	                $(iframe).parents('form').submit(function(){
	                    disableDesignMode(true);
	                });
	            }

	            var iframeDoc = $(iframe.contentWindow.document);

	            var select = $('select', tb)[0];
	            iframeDoc.mouseup(function(){ 
	                setSelectedType(getSelectionElement(), select);
	                return true;
	            });
                
	            iframeDoc.keyup(function() {
	                setSelectedType(getSelectionElement(), select);
	                var body = $('body', iframeDoc);
					
	                if(body.scrollTop() > 0) {
                        var iframe_height = parseInt(iframe.style['height'])
                        if(isNaN(iframe_height))
                            iframe_height = 0;
                        var h = Math.min(opts.max_height, iframe_height+body.scrollTop());
						h = Math.max(h, opts.min_height);
						
	                    iframe.style['height'] = (h + 'px');
                    }
	                return true;
	            });

	            return tb;
	        };

		    function formatText(command, option) {
	            iframe.contentWindow.focus();
	            try{
	                iframe.contentWindow.document.execCommand(command, false, option);
		            // SD begin change
		            var markup = iframe.contentWindow.document.body.innerHTML;

		            markup = markup.replace(/<span\s*(class="Apple-style-span")?\s*style="font-weight:\s*bold;">([^<]*)<\/span>/ig, '<strong>$2</strong>');
		            markup = markup.replace(/<span\s*(class="Apple-style-span")?\s*style="font-style:\s*italic;">([^<]*)<\/span>/ig, '<em>$2</em>');

		            iframe.contentWindow.document.body.innerHTML = markup; 
		            // SD end change
	            }catch(e){
                    //console.log(e)
                }
	            iframe.contentWindow.focus();
	        };
	
			// SD begin change
		    function stripTags(iframe, text) {
		        iframe.contentWindow.focus();

		        var markup = iframe.contentWindow.document.body.innerHTML;                
				markup = markup.replace(/(<br[^>]*)>/g, "\n"); 
				markup = markup.replace(/(<[^>]+)>/g, '');
				markup = markup.replace(/\n/g, '<br />'); 
		        iframe.contentWindow.document.body.innerHTML = markup; 

		        iframe.contentWindow.focus();
		    }
		    // SD end change
	
	        function setSelectedType(node, select) {
	            while(node.parentNode) {
	                var nName = node.nodeName.toLowerCase();
	                for(var i=0;i<select.options.length;i++) {
	                    if(nName==select.options[i].value){
	                        select.selectedIndex=i;
	                        return true;
	                    }
	                }
	                node = node.parentNode;
	            }
	            select.selectedIndex=0;
	            return true;
	        };

	        function getSelectionElement() {
	            if (iframe.contentWindow.document.selection) {
	                // IE selections
	                selection = iframe.contentWindow.document.selection;
	                range = selection.createRange();
	                try {
	                    node = range.parentElement();
	                }
	                catch (e) {
	                    return false;
	                }
	            } else {
	                // Mozilla selections
	                try {
	                    selection = iframe.contentWindow.getSelection();
	                    range = selection.getRangeAt(0);
	                }
	                catch(e){
	                    return false;
	                }
	                node = range.commonAncestorContainer;
	            }
	            return node;
	        };
	
		    // enable design mode now
		    enableDesignMode();
		
        }); //return this.each
    };// rte

})(jQuery);
