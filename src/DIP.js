(function(){

    var DIP = {};
    window.DIP = DIP;
    DIP.Control = DIP.prototype = {};
    DIP.Plugin  = {}; 
    DIP.loaded = {};
    DIP.source = [];
    DIP.engine = {};
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
    
    
    String.prototype.ucfirst = function(){
        return this.charAt(0).toUpperCase() + this.substr(1);
    };
    
    
    
    DIP.Ajax = function(options, _call_el){
        
        var the = this;
        
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
            var handle = the.getHandleNameByLink(the.defaults.url);
            if(typeof handle !== "undefined"){
                 var method = the.getHandleMethod(handle);
                 if(method){
                     method(data, ajax, the.defaults);
                 }
            }
            if(typeof data.snippets !== "undefined"){
                $.each(data.snippets, function(s_name, s_data){
                    var res = $(document).find('#'+s_name).html(s_data);
                    DIP.dynamic(res);
                    var name = the.getHandleName(s_name);
                    var method = the.getHandleMethod('redraw_'.name);
                    if(typeof method !== "undefined"){
                        method.call(res,data,ajax);
                    }
                });            
            }
            
        };
        
        var error = function(request){console.error('DIP AJAX '+request.responseText);};
        
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
            onSucces:   function(){},
            error:      this.error,
            
            
        };
        
        $.extend(this.defaults, options);

        
        this.runajax = function(){
            var start = true;
            
            var handle = this.getHandleNameByLink(this.defaults.url);
            
            if(typeof handle !== "undefined"){
                start = this.getHandleMethod('start_'+handle);
                var er = this.getHandleMethod('error_'+handle);
                if(er){
                   error = er; 
                }
            }
            
            if(start || typeof start === "undefined"){
                
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
    
    
    
    
    DIP.engine.dynamic.ajax = function(el){
        
       $(el ? el :document).find('a.ajax').on('click', function(e){
            e.preventDefault();
            var link = DIP.URL($(this));
            new DIP.Ajax({url:link.source},$(this));
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
    
    
    
 
     
    DIP.Run = function(){
        
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