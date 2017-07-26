(function(){

    var DIP = {};
    window.DIP = DIP;
    DIP.Config = {
        ajax_class: 'd-ajax'
    };
    DIP.Control = DIP.prototype = {};
    DIP.Plugin  = {}; 
    DIP.loaded = {};
    DIP.source = [];
    DIP.engine = {};
    DIP.events = {};
    DIP.engine.dynamic = {};
    DIP.libs = {
        //Moment: ['/js/main/libs/moment.min.js', 'moment']
    };
    
    DIP.URL = function(url){
        if( url instanceof jQuery){
            if(url.length > 0 && url.is('a')){
                url = url.attr('href');   
            }else{
                return console.error('DIP.URL jquery object is emty or not select <A> link');
            } 
        }else if(!url){
            url = document.URL;
        }
        
        var a =  document.createElement('a');
        a.href = url;
        
        return {
            source: url,
            protocol: a.protocol.replace(':',''),
            host: a.hostname,
            
            port: a.port,
            query: a.search,
            params: (function(){
                var ret = {},
                    seg = a.search.replace(/^\?/,'').split('&'),
                    len = seg.length, i = 0, s;
                for (;i<len;i++) {
                    if (!seg[i]) { continue; }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
            hash: a.hash.replace('#',''),
            setHash: function(hash){window.location.hash = hash;},
            path: a.pathname.replace(/^([^\/])/,'/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1],
            segments: a.pathname.replace(/^\//,'').split('/'),
        };
    };
    
    DIP.getPath = function(plugin){
        var path = false;
        var result = '';
        $.each(DIP.source, function(i,v){
            if(v.source == plugin){
                path = v.path;
            }
        });
        
        if(path){
            var leng = DIP.URL(path).segments.length-1;
            $.each(DIP.URL(path).segments, function(i,v){
                result += leng > i? '/'+v : '';
            });
        }
        return result;
    };
    
    DIP.count = function(object){
        var result = 0;  
        if(object){
            $.each(object, function(){
                result++;
            });  
        }
        return result;
    }; 
    
    DIP.getRandomColor = function() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    
    DIP.convertHex = function(hex,opacity){
        hex = hex.replace('#','');
        r = parseInt(hex.substring(0,2), 16);
        g = parseInt(hex.substring(2,4), 16);
        b = parseInt(hex.substring(4,6), 16);

        result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
        return result;
    };
    
    DIP.isset = function(object){
        return typeof object === "undefined" ? false : true;
    };
    
    DIP.isObject = function(object){
        return typeof object === "object" ? true : false;
    };
    
    DIP.isFunction = function(object){
        return typeof object === "function" ? true : false;
    };
    
    DIP.getObjectMethod = function(object, name){
        var res = false;
        $.each(object, function(i,v){
            if(name === i){
                res = v;
            }
        });
        return res;
    };
    
    String.prototype.ucfirst = function(){
        return this.charAt(0).toUpperCase() + this.substr(1);
    };
    
    var ajax_events = [];

    DIP.Ajax = function(options, _call_el){
        
        if(typeof  options == 'function'){
            ajax_events[ajax_events.length] = options;
            return;
        }
        
        var the = this;
        
        this.getFormMethod = function(FormName){
            var method;
            $.each(DIP.loaded,function(id_control,methods){
                if(typeof methods[FormName] !== "undefined"){
                    method = methods[FormName];
                    return true;
                }
            });
            return method;
        };
        
        this.getFormName = function(string){
            
            var name = "form";
            var forms = string.split('-');
            if(forms.length <= 1){
                forms = string.split('-');
            }

            $.each(forms,function(i,v){
               if(i>0){
                   name += v.charAt(0).toUpperCase() + v.slice(1);
               } 
            });
            return name;
        };
        
        this.getHandleName = function(string){
           
            var name = "handle";
            var handle = string.split('--');
            if(handle.length <= 1){
                handle = string.split('-');
            }

            $.each(handle,function(i,v){
               if(i>0){
                   name += v.charAt(0).toUpperCase() + v.slice(1);
               } 
            });
            return name;
        };
        
        this.getHandleNameByLink = function(link){
            var _do = DIP.URL(link).params.do;
            if(_do){
                var name = "handle";
                var handle = _do.split('-');

                $.each(handle,function(i,v){
                    name += v.charAt(0).toUpperCase() + v.slice(1);
                });
                return name;
            }
            return false;
        };
        
        this.getHandleMethod = function(HandleName){
            var method;
            $.each(DIP.loaded,function(id_control,methods){
                if(typeof methods[HandleName] !== "undefined"){
                    method = methods[HandleName];
                    return true;
                }
            });
            return method;
        };
        
        
        this.success = function(data){
            var ajax = this;
            the.defaults.onSuccess(data, ajax);

            if(ajax.work && !DIP.isset(data.redirect)){
                $("body .work").removeClass('active');
            }

            function minify_html(input) {
                return input
                    .replace(/<\!--(?!\[if)([\s\S]+?)-->/g, "") // Remove HTML comments except IE comments
                    .replace(/>[^\S ]+/g, '>')
                    .replace(/[^\S ]+</g, '<')
                    .replace(/>\s{2,}</g, '><');
            }
            
            if(DIP.isset(data.snippets)){
                $.each(data.snippets, function(s_name, s_data){


                    if(typeof CryptoJS !== 'undefined') {
                        if(typeof $(document).find('#' + s_name).attr('data-hash') !== 'undefined'){
                            var default_hash = $(document).find('#' + s_name).attr('data-hash')
                            s_data = $("<div/>").html(s_data);
                            s_data = s_data.html().replace(/^\s+|\r\n|\n|\r|(>)\s+(<)|\s+$/gm, '$1$2');
                            var new_hash = CryptoJS.MD5(s_data).toString();

                            if(default_hash !== new_hash){
                                var res = $(document).find('#' + s_name).html(s_data);
                                $(document).find('#' + s_name).attr('data-hash', new_hash)
                                DIP.dynamic(res)
                            }else{
                                var res = $(document).find('#' + s_name)
                            }
                        }
                    }else{
                        var res = $(document).find('#' + s_name).html(s_data);
                        DIP.dynamic(res);
                    }


                    if (DIP.events.ajaxsnippets !== undefined) {
                        $.each(DIP.events.ajaxsnippets, function (i, v) {
                            v(res, data, ajax);
                        });
                    }

                    var name = the.getHandleName(s_name);
                    var method = the.getHandleMethod('redraw_'.name);
                    if (DIP.isset(method)) {
                        method.call(res, data, ajax);
                    }

                });            
            }
            
            var handle = the.getHandleNameByLink(the.defaults.url);
            if(DIP.isset(handle)){
                 var method = the.getHandleMethod(handle);
                 if(method){
                     method(data, ajax, the.defaults);
                 }
            }

            if(the.defaults.form){
                var form = the.getFormName(the.defaults.form);
                var j_form = $('#'+the.defaults.form);
                if(DIP.isset(form)){
                    var form_method = the.getFormMethod(form);
                    if(DIP.isObject(form_method)){
                        var met_name = 'success';
                        var method = form_method[met_name];
                        if(the.defaults.from_button_name && DIP.isset(method)){
                            method(data,j_form,the.defaults);
                        }
                    }
                    if(DIP.isFunction(form_method)){
                        form_method(data,j_form,the.defaults);
                    }
                }
            }else{

                if(DIP.isset(data.h_save) || data.h_save == true){
                    History.pushState({}, '', ajax.url);
                }
            }

            if(DIP.isset(data.redirect)){
                document.location.href = data.redirect;
            }
            
            if(DIP.isset(data.h_back)){
                History.back();
            }
            
            $.each(ajax_events, function(i,v){
                v(data,ajax);
            });
            
        };
        
        var error = function(request,e){
            var ajax = this;
            if(ajax.work){
                $("body .work").removeClass('active');
            }
            if($('#tracy-debug-bar').length > 0){
                var error_page = document.implementation.createHTMLDocument();
                error_page.open();
                error_page.write(request.responseText);
                error_page.close();

                error_page = new jQuery(error_page);
                var dumps = error_page.find('.tracy-dump');

                if(dumps.length > 0){
                    $(document).find('body').prepend(dumps);
                }

                var child = error_page.find('body').children();
                var text = error_page.find('body').text();
                if(child.length == 0){
                    var q =  $('<div class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">×</a><strong>Error</br>HTTP status '+request.status+'<br> URL: '+the.defaults.url+'</strong></br></div>');
                    q.append('<code>'+text+'</code>');
                    $('body').prepend(q);
                }else{
                    
                    var error = {
                        error: e,
                        request: request,
                        ajax_settings: the.defaults
                    };
                    
                    console.warn('Ajax '+e, error);
                }

                return false;
            }else{
                console.error('DIP AJAX '+request.responseText);
            }
        };
        
        this.error = function(request, ajaxOptions, thrownError){
            error.call(_call_el, request, ajaxOptions, thrownError);
        };
        
         
        this.defaults = {
            type:       'POST',
            dataType:   'json', 
            handle:     "",
            url:        DIP.URL().path+"?do="+options.handle,
            data:       false,
            async :     true, 
            success:    this.success,
            onSuccess:   function(){},
            error:      this.error,
            form:       false,
            from_button_name: false,
            call_el: _call_el,
            work: false
            
        };
        
        $.extend(this.defaults, options);
        
        this.runajax = function(){
            var start = true;
            
            var handle = this.getHandleNameByLink(this.defaults.url);
            if(DIP.isset(handle)){
                start = this.getHandleMethod('start_'+handle);
                var er = this.getHandleMethod('error_'+handle);
                if(er){
                   error = er; 
                }
            }
            if(the.defaults.form){
                var form = the.getFormName(the.defaults.form);
                var j_form = $('#'+the.defaults.form);
                if(DIP.isset(form)){
                    var form_method = the.getFormMethod(form);
                    if(DIP.isObject(form_method)){
                        if(DIP.isset(form_method.start)){
                            start = form_method.start(j_form,the.defaults);
                        }

                        var btn_name = String('button_'+the.defaults.from_button_name);
                        var button_method = form_method[btn_name];
                        if(the.defaults.from_button_name && DIP.isset(button_method)){
                            start = button_method(j_form,the.defaults);
                        }
                    }

                }
            }
            
            if(start || typeof start === "undefined"){

                if(this.defaults.work){
                    $("body .work").addClass('active');
                }

                if(typeof start === "function"){
                    var re = start.call(_call_el, this.defaults);
                    if(typeof re === "undefined" || re == true){
                        $.ajax(this.defaults);
                    }
                }else{
                    $.ajax(this.defaults);
                }   
            }
        };
        this.runajax();
    };
    
    
    
    DIP.addAjxSnippetsEvent = function(fn){
        if(DIP.events.ajaxsnippets === undefined){
            DIP.events.ajaxsnippets = [];
        }
        DIP.events.ajaxsnippets[DIP.events.ajaxsnippets.length] = fn;
    };
    
    
    DIP.guid = function(){
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return 'snipet'+s4()+s4()+s4()+s4()+s4();
    };
    
    
    DIP.onload = function(){
        var elements = $('body').find('[data-onload]');
        $.each(elements, function(i,v){
            var fnString  = $(v).attr('data-onload');
            eval(fnString);
        });
    };
    
    DIP.getSource = function(src){
        var source = false;
        $.ajax({
            url: src,
            success: function(e){
                source = e;
            },
            async: false,
            dataType: 'text'
        });
        return source;
    };
    
    
    DIP.require = function(src){
        var code = DIP.getSource(src);
        var Object = eval(code);
        DIP.source[DIP.source.length] = {
            path:src,
            source: Object
        };
        return Object;
    };
    
    
    DIP.engine.events = function(object){
               
        if(typeof object.startup != 'undefined'){
            object.startup();
        }
        DIP.engine.runs(object);
    };
    
    
    DIP.engine.getArguments = function(func){
        var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        var ARGUMENT_NAMES = /([^\s,]+)/g;
        
        var fnStr = func.toString().replace(STRIP_COMMENTS, '');
        var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
        if(result === null){
            result = [];
        }
        return result;
    };
    
    
    DIP.dynamic = function(elements){
        $.each(DIP.engine.dynamic, function(name, _method){
            _method(elements);
        });
    };
    
    
    DIP.AjaxByElement = function(el,e){

        if(el.prop('nodeName') == "A"){
            if(e) {
                e.preventDefault();
            }
            var link = DIP.URL($(el));
            var $work = false;
            if($(el).hasClass("workrun")){
                $work = true;
            }
            new DIP.Ajax({url:link.source, work: $work},el);

        }else if(el.prop('nodeName') == "INPUT" || el.prop('nodeName') == 'BUTTON'){

            var $work = false;
            if(el.hasClass("workrun")){
                $work = true;
            }

            var form = el.get(0).form;
            var form_name = $(form).attr('id');
            var action = $(form).attr('action');
            var data = $(form).serialize();
            var button_name = el.attr('name');
            data += "&"+button_name+"=true";

            var valid = true;
            if(typeof Nette.validateControl === "function"){
                $(form).find(':input').each(function(){
                    if(Nette.validateControl(el[0]) == false){
                        valid = false;
                    }
                });
            }

            if(valid){
                new DIP.Ajax({
                    url: action,
                    data: data,
                    form: form_name,
                    from_button_name: button_name,
                    work:$work
                });
            }
        }

    }
    
    
    DIP.engine.dynamic.ajax = function(el){
        
        $(el ? el :document).find('a.'+DIP.Config.ajax_class).not('.confirm').on('click', function(e){
            e.preventDefault();
            new DIP.AjaxByElement($(this))

        });
        
        $(el ? el :document).find('input.'+DIP.Config.ajax_class+',button.'+DIP.Config.ajax_class).not('.confirm').on('click', function(e){
            e.preventDefault();

            new DIP.AjaxByElement($(this), e)
        });
        
    };
    
    
    DIP.engine.dynamic.dataActions = function(el){
        
        var actions = {
            'js-click': function(el,fn){
                el.on('click', function(e){
                    fn.call(this,e);
                });
            }
        };
        
        $.each(actions,function(action, func){
            
            if(el){
                var elements =  $(el).find('['+action+']');
            }else{
                var elements = $('['+action+']');
            }
            
            elements.each(function(i,el){
                var attr = $(el).attr(action).split(':');
                var link = "DIP.loaded";
                $.each(attr,function(i,v){
                    link += i > 0? ".action"+v : "."+v.charAt(0).toUpperCase() + v.slice(1);
                });
                link += "";
                var fnR = eval(link);
                func($(el),fnR);
            });
        });
    
    };
    
       
    DIP.engine.runs = function(object){
        $.each(object, function(i,v){
            if(i.substr(0, 3) == "run" && typeof v == "function"){
                v();
            }
        });
        
    };
    

    DIP.setSnippetsHas = function(){
        if(typeof CryptoJS !== 'undefined') {
            var  items = $("body").find("div[id^='snippet--']");
            items.each(function(){
                var html = $(this).html().replace(/^\s+|\r\n|\n|\r|(>)\s+(<)|\s+$/gm, '$1$2')
                var hash = CryptoJS.MD5(html).toString()
                $(this).attr('data-hash', hash);
            })
        }
    }
    
    
    DIP.Run = function(){
        DIP.setSnippetsHas();

        $.each(DIP.Control, function(i,v){
            DIP.loaded[i] = new DIP.Control[i](DIP);
            DIP.loaded[i].arguments = DIP.engine.getArguments(DIP.Control[i]);
            DIP.engine.events(DIP.loaded[i]);
        });

        DIP.onload();
        DIP.dynamic($(document));
        return DIP;
    };
    
})();
