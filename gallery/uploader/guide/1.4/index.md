## 综述

Uploader是非常强大的异步文件上传组件，支持ajax、iframe、flash三套方案，实现浏览器的全兼容，调用非常简单，内置多套主题支持和常用插件，比如验证、图片预览、进度条等。
广泛应用于淘宝网，比如退款系统、爱逛街、二手、拍卖、我的淘宝、卖家中心、导购中心等。
拥有非常不错的扩展性，可以自己定制主题和插件。

* 版本：1.4
* 基于：kissy1.3（兼容kissy1.2，不兼容kissy1.1.6）
* 作者：明河（剑平）、紫英、飞绿，感谢苏河、溪夏、正豪等主题和插件作者


#### ImageUploader的特性

* 支持ajax、flash、iframe三种方案，兼容所有浏览器。（iframe不推荐使用）
* 多主题支持，可以自己定制主题
* 支持多选批量上传
* 支持上传进度显示
* 支持取消上传
* 支持图片预览（使用flash上传不支持）
* 支持上传验证
* 多种配置方式

## demo汇总

<ul class="thumbnails">
    <li class="span3">
        <a href="./js-config-use.html" class="demo-item" target="_blank">
            <div class="thumbnail">简单demo：js配置上传组件</div>
        </a>
    </li>
    <li class="span3">
        <a href="./pro-config-use.html" class="demo-item" target="_blank">
            <div class="thumbnail">简单demo：属性配置上传组件</div>
        </a>
    </li>
    <li class="span3">
        <a href="./auth.html" class="demo-item" target="_blank">
            <div class="thumbnail">上传验证控制的demo</div>
        </a>
    </li>
    <li class="span3">
        <a href="./events.html" class="demo-item" target="_blank">
            <div class="thumbnail">组件全部事件演示</div>
        </a>
    </li>
    <li class="span3">
        <a href="default-data-show.html" class="demo-item" target="_blank">
            <div class="thumbnail">渲染默认队列数据的demo</div>
        </a>
    </li>
    <li class="span3">
        <a href="queue.html" class="demo-item" target="_blank">
            <div class="thumbnail">图片队列控制的demo</div>
        </a>
    </li>
    <li class="span3">
        <a href="flash-upload-type.html" class="demo-item" target="_blank">
            <div class="thumbnail">只使用flash上传的demo</div>
        </a>
    </li>
    <li class="span3">
        <a href="iframe-upload-type.html" class="demo-item" target="_blank">
            <div class="thumbnail">只使用iframe上传的demo</div>
        </a>
    </li>
    <li class="span3">
        <a href="" class="demo-item" target="_blank">
            <div class="thumbnail">常用属性控制</div>
        </a>
    </li>
    <li class="span3">
        <a href="" class="demo-item" target="_blank">
            <div class="thumbnail">常用方法控制</div>
        </a>
    </li>
</ul>

## 组件内置的主题

<ul class="thumbnails">
    <li class="span3">
        <a href="theme-imageUploader.html" class="demo-item" target="_blank">
            <div class="thumbnail">
                <h4>主题：imageUploader</h4>
            </div>
        </a>
    </li>
    <li class="span3">
        <a href="theme-refundUploader.html" class="demo-item" target="_blank">
            <div class="thumbnail">
                <h4>主题：refundUploader</h4>
            </div>
        </a>
    </li>
    <li class="span3">
        <a href="theme-loveUploader.html" class="demo-item" target="_blank">
            <div class="thumbnail">
                <h4>主题：loveUploader</h4>
            </div>
        </a>
    </li>
    <li class="span3">
        <a href="theme-ershouUploader.html" class="demo-item" target="_blank">
            <div class="thumbnail">
                <h4>主题：ershouUploader</h4>
            </div>
        </a>
    </li>
    <li class="span3">
        <a href="theme-singleImageUploader.html" class="demo-item" target="_blank">
            <div class="thumbnail">
                <h4>singleImageUploader</h4>
            </div>
        </a>
    </li>
</ul>

## 3种方式初始化组件

gallery的包配置是必不可少：

{% highlight javascript %}
KISSY.config({
    packages:[
        {
            name:"gallery",
            path:"http://a.tbcdn.cn/s/kissy/",
            charset:"utf-8"
        }
    ]
});
{% endhighlight %}

### 1.使用js配置初始化组件

{% highlight javascript %}
KISSY.use('gallery/form/1.3/uploader/imageUploader', function (S, ImageUploader) {

    new ImageUploader('#J_JsUploaderBtn','#J_JsUploaderQueue',{
        // 文件域
        name:"Filedata",
        //处理上传的服务器端脚本路径
        action:"upload.php",
        //用于放服务器端返回的url的隐藏域
        urlsInputName:"jsImageUrls"
    }).render();
})
{% endhighlight%}

#### 配置参数说明

<table class="table table-bordered table-striped">
    <thead>
        <tr>
            <th style="width: 100px;">参数名</th>
            <th style="width: 50px;">类型</th>
            <th style="width: 100px;">默认值</th>
            <th>描述</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>action</td>
            <td>String</td>
            <td>""</td>
            <td>服务器端处理上传的路径</td>
        </tr>
        <tr>
            <td>name</td>
            <td>String</td>
            <td>Filedata</td>
            <td>文件上传域name名，服务器端通过name来获取和处理上传数据</td>
        </tr>
        <tr>
            <td>urlsInputName</td>
            <td>String</td>
            <td>''</td>
            <td>
                用于存放服务器端返回的文件路径的input（type="hidden"），当页面内不存在这个input时，组件会自动创建一个
            </td>
        </tr>
    </tbody>
</table>

<div class="alert alert-info">
    <strong>PS:</strong>
    这三个配置是最核心的配置，一般是必不可少，更多的接口说明请看
    <a href="http://www.36ria.com/demo/gal/gallery/form/1.3/doc/symbols/Uploader.html" target="_blank">
        API
doc
    </a>
    ，后面将逐步介绍更多API。
</div>

### 2.使用标签属性配置初始化

#### 1) 需要个input标签（type="image-uploader"）

<table class="table table-bordered table-striped">
    <thead>
        <tr>
            <th style="width: 200px;">属性</th>
            <th>描述</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
                <code>type="image-uploader"</code>
            </td>
            <td>此属性为了配合Butterfly使用，表明此input为图片上传专用组件</td>
        </tr>
        <tr>
            <td>
                <code>id="J_UploaderBtn"</code>
            </td>
            <td>脚本实例化上传组件时使用的钩子</td>
        </tr>
        <tr>
            <td>
                <code>name="Filedata"</code>
            </td>
            <td>非常重要，文件上传域name名，服务器端通过name来获取和处理上传数据</td>
        </tr>
        <tr>
            <td>
                <code>value="上传图片"</code>
            </td>
            <td>上传按钮上的文案</td>
        </tr>
    </tbody>
</table>

#### 2) 创建一个input（hidden）用于存放服务器端返回的url

给上传按钮input加上 `urlsInputName="imageUrls"` 属性，这样当上传成功后图片url会被加入到这个隐藏域中（多个图片路径以逗号隔开）。

#### 3) 创建一个空的图片队列

给上传按钮input加上 `queueTarget="#J_UploaderQueue"` 属性，将上传按钮和上传队列关联起来，当选择完图片后，自动显示图片。

#### 4) 配置服务器端参数

上传组件必须有服务器端脚本配合，所以需要个服务器端路径。可以使用 `action` 属性。

可能你还需要向服务器post一些参数，比如用户名，商品id等，可以使使用 `postData='{"author":"明河"}'` 。

#### 5) demo中完整的html结构

<pre class='brush: xml; '>
    <div class="grid">
        <input class="g-u" id="J_UploaderBtn" name="Filedata" type="image-uploader" value="上传图片" queueTarget="#J_UploaderQueue" action="upload.php" urlsInputName="imageUrls">
        <!--用来存放服务器端返回的图片路径，多个图片以逗号隔开-->
        <input type="hidden" name="imageUrls"></div>
    <ul id="J_UploaderQueue" class="grid"></ul>
</pre>

#### 6) 初始化ImageUploader

配置下gallery包路径（为了利用淘宝cdn，可以快速引用butterfly库，所以将代码托管在kissy gallery下）。

{% highlight javascript %}
var S = KISSY,
    path = "http://a.tbcdn.cn/s/kissy/";
KISSY.config({
    packages:[
        {
            name:"gallery",
            path:path,
            charset:"utf-8"
        }
    ]
});
{% endhighlight %}

初始化ImageUploader：

{% highlight javascript %}
KISSY.use('gallery/form/1.3/uploader/imageUploader', function (S, ImageUploader) {
    new ImageUploader('#J_UploaderBtn').render();
})
{% endhighlight %}

<div class="alert alert-info">
    当实例化ImageUploader时，组件会自动加载主题js和css文件，比如没用
    <code>theme</code>
    属性时，加载默认主题
    <code>theme="imageUploader"</code>
    ，
    <code>gallery/form/1.3/uploader/themes/imageUploader/index-min.js</code>
    和
    <code>gallery/form/1.3/uploader/themes/imageUploader/style.css</code>
    。
</div>