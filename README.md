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