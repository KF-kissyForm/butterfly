/**
 * @fileoverview
 * @author 剑平（明河）<minghe36@gmail.com>
 **/
KISSY.add(function (S, Node, Queue) {
    describe('queue test', function () {
        var queue;
        it('new Queue', function () {
            queue = new Queue();
            expect(S.isArray(queue.get('files'))).toBeTruthy();
        });
        it('add(file)', function () {
            var file = {'name':'test.jpg',
                'size':2000,
                'input':{},
                'file':{'name':'test.jpg', 'type':'image/jpeg', 'size':2000}
            };
            var queueFile = queue.add(file);
            expect(S.isObject(queueFile)).toBeTruthy();
        });
        it('添加完文件后files属性为1',function(){
            var len = queue.get('files').length;
            expect(len).toEqual(1);
        })
    });
}, {requires:[ 'node', 'gallery/form/1.4/uploader/queue']});