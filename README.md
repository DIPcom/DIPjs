DIPjs for Nette Framework
=========================


How to install
--------------

```sh

$ bower install dipcom-dipjs

```


```html

<head>
    <script src="{$basePath}/bower_components/jquery/dist/jquery.min.js" type="text/javascript"></script>
    <script src="{$basePath}/bower_components/dipcom-dipjs/DIP.js" type="text/javascript"></script>
</head>

<body>
    <script>
        $(document).ready(function(){
            DIP.Run();
        });
    </script>
</body>

```


Custom control.
```js

DIP.Control.YoyrControlName = function(){
    
    var the = this;
    
    
    this.startup = function(){
        //First method run    
    };
    
    
    
    this.runMethodName = function(){
        //Auto run method
    }
    
    /*
     * if you click on link with class 'ajax' that runs ajax.
     * <a href="?do=name" class="ajax">link</a>
     *   
     */
    this.handleName = function(result, events){
        //Method runs if ajax handle is succeeded
    }
    

}

```
