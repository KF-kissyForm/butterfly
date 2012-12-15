KISSY.add(function (S, Node,io,HtmlMock,Butterfly) {
    var $ = Node.all;
    var htmlMock = new HtmlMock();

    describe('Butterfy单textInput测试', function () {
        var butterfly;
        it('加载个demo dom',function(){
            htmlMock.load('specs/fixtures/butterfly/form-1.html');
            expect('#form-1').toExist();
        })
        it('实例化Butterfly',function(){
            butterfly = new Butterfly('#form-1');
            var renderCallback = jasmine.createSpy('renderCallback');
            var isReady = false;
            var username;
            butterfly.on('render',function(ev){
                isReady = true;
                renderCallback(ev);
            })
            butterfly.render();
            waitsFor(function(){
                return  isReady === true;
            },"",500);

            runs(function(){
                var ev = renderCallback.mostRecentCall.args[0];
                expect(butterfly.get('collection')).not.toBeNull();
                expect(renderCallback).toHaveBeenCalled();
                expect(butterfly.get('auth')).not.toBeNull();
                expect(S.isEmptyObject(butterfly.get('uis'))).toBeFalsy();
            })
        })
        it('获取字段',function(){
            username = butterfly.field('username');
            expect(S.isObject(username)).toBeTruthy();
        });
        it('验证字段error',function(){
            username = butterfly.field('username');
            var isPass = username.test();
            expect(isPass).toBeFalsy();
        })
        it('验证字段success',function(){
            username = butterfly.field('username');
            username.val('明河');
            var isPass = username.test();
            expect(isPass).toBeTruthy();
        })
    });

},{requires:['node','ajax','jasmine/htmlMock',"gallery/form/1.4/butterfly/index"]});