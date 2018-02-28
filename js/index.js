/**
 * Create By Dennis Wang On 2018/2/27
 */

/**
 * 画线
 * lineObj 对象 连线配置的相关信息
 * 返回生成的线对象
 */
function drawLine(lineObj) {
    var svg = document.getElementById('svg');

    // 创建线的标签
    var polyLine = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');

    // 配置连线信息
    polyLine.setAttribute('id', lineObj.id);
    polyLine.setAttribute('points', lineObj.points);
    polyLine.setAttribute('style', `fill:none;stroke:${lineObj.lineColor};stroke-width:${lineObj.lineWidth}`);

    // 如果当前节点被隐藏，连线重绘也将隐藏
    if (!lineObj.displayStatus) {
        polyLine.setAttribute('display', 'none');
    }

    svg.appendChild(polyLine);
}

/**
 * 拼接连线点坐标
 * dotPositionInfo 对象 连线的起止点位置信息
 * 返回线的起止位置信息
 */
function getPoints(dotPositionInfo) {
    var points = '';

    points = `${dotPositionInfo.startX},${dotPositionInfo.startY} ${dotPositionInfo.startX},${dotPositionInfo.endY} ${dotPositionInfo.endX},${dotPositionInfo.endY}`;

    return points;
}

/**
 * 获取连线开始点坐标
 * blockObj jq对象 节点块信息
 * 返回需要连线点的开始坐标信息
 */
function getLineStartDot(blockObj) {
    // 开始点坐标信息
    var stratInfo = new Object();

    // 获取起点中的白色圆圈的对象
    var dot = blockObj.find('.dot').eq(0);

    // 获取白色圆圈的高度
    var dotHeight = parseFloat(dot.css('height'));

    // 节点块宽高及坐标位置
    var blockWidth = parseFloat(blockObj.css('width')),
        blockHeight = parseFloat(blockObj.css('height')),
        blockLeft = parseFloat(blockObj.css('left')),
        blockTop = parseFloat(blockObj.css('top'));

    // 起点坐标
    var startX, startY;
    startX = blockLeft + blockWidth / 2;
    startY = blockTop + blockHeight - dotHeight / 2;

    // 插入到对象中
    stratInfo.startX = startX;
    stratInfo.startY = startY;

    return stratInfo;
}

/**
 * 获取连线结束点坐标
 * blockObj jq对象 节点块信息
 * 返回需要连线点的结束坐标信息
 */
function getLineEndDot(blockObj) {
    // 开始点坐标信息
    var endInfo = new Object();

    // 节点块宽高及坐标位置
    var blockWidth = parseFloat(blockObj.css('width')),
        blockHeight = parseFloat(blockObj.css('height')),
        blockLeft = parseFloat(blockObj.css('left')),
        blockTop = parseFloat(blockObj.css('top'));

    // 起点坐标
    var endX, endY;
    endX = blockLeft;
    endY = blockTop + blockHeight / 2;

    // 插入到对象中
    endInfo.endX = endX;
    endInfo.endY = endY;

    return endInfo;
}

/**
 * 绘线入口
 * blockObj jq对象 节点块信息
 * displayStatus boolean 判断当前节点是否是隐藏状态
 */
function drawLineEntrance(blockObj, displayStatus) {
    // 给当前节点绘线
    var level = blockObj.data('level').toString(); //当前节点的层级

    if (level.indexOf('-') != -1) {
        var levelIndex = level.lastIndexOf('-');

        var parentLevelNum = level.slice(0, levelIndex); //上一节点的层级

        var parentLevel = $('div[data-level= ' + parentLevelNum + ']');

        // 获取起止点坐标点
        var stratDotInfo = getLineStartDot(parentLevel);
        var endDotInfo = getLineEndDot(blockObj);

        // 连线信息
        var dotPositionInfo = {
            startX: stratDotInfo.startX,
            startY: stratDotInfo.startY,
            endX: endDotInfo.endX,
            endY: endDotInfo.endY
        }

        var points = getPoints(dotPositionInfo);

        // 连线配置
        var lineObj = {
            points: points,
            lineColor: 'rgb(38,154,149)',
            lineWidth: '2',
            id: parentLevel.data('level').toString() + '_' + blockObj.data('level').toString(),
            displayStatus: displayStatus
        }

        drawLine(lineObj);
    }
}

/**
 * 节点点击事件
 * blockObj jq对象 节点块信息
 */
function dotMouseDown(blockObj) {
    blockObj.bind('mousedown', function(e) {
        console.log(e)
        e.stopPropagation();
        // 获取当前点击时的位置坐标
        var innitX = e.pageX,
            innitY = e.pageY;

        var blockAllArr = [];
        // 所有节点信息
        $('.content_block').each(function() {
            var obj = {
                level: $(this).data('level').toString(),
                left: parseFloat($(this).css('left')),
                top: parseFloat($(this).css('top'))
            };

            blockAllArr.push(obj);
            obj = null;
        })

        // 给内容块盒子增加可移动事件
        $('#content_wrap').bind('mousemove', function(e) {
            // 获取移动距离
            var nowX = e.pageX,
                nowY = e.pageY;

            // 计算移动距离
            var moveDistanceX = parseFloat(nowX) - parseFloat(innitX),
                moveDistanceY = parseFloat(nowY) - parseFloat(innitY);

            // 清空画布
            $('#svg').html('');

            // 给所有节点更改位置并重绘线
            if (blockAllArr.length != 0) {
                for (var i in blockAllArr) {
                    var level = blockAllArr[i].level;
                    var nowLeft = blockAllArr[i].left + moveDistanceX;
                    var nowTop = blockAllArr[i].top + moveDistanceY;

                    var blockDot = $(`div[data-level=${level}]`);
                    // 改变节点位置
                    blockDot.css({ left: nowLeft, top: nowTop });

                    // 获取当前节点的显示状态
                    var displayStatus = blockDot.css('display');

                    if (displayStatus == 'none') {
                        // 重绘线
                        drawLineEntrance(blockDot, false);
                    } else {
                        // 重绘线
                        drawLineEntrance(blockDot, true);
                    }
                }
            }
        });
    })
}

function dotMouseUp(blockObj) {
    blockObj.bind('mouseup', function() {
        $('#content_wrap').unbind('mousemove');
    })
}

/**
 * 根节点面板判断
 * blockObj jq对象 根节点信息
 * dot jq对象 面板折叠按钮
 */
function rootPannlJudge(blockObj, dot) {
    var pannl = dot.data('pannl');
    if (pannl) {
        blockObj.siblings().hide();
        $('#svg').find('polyline').hide();
        dot.data('pannl', false);
    } else {
        blockObj.siblings().show();
        $('#svg').find('polyline').show();
        dot.data('pannl', true);
    }
}

/**
 * 子节点面板判断
 * dot jq对象 面板折叠按钮
 */
function childPannlJudge(dot, levelNum) {
    // 当前面板状态
    var displayStatus = dot.data('pannl');
    $('.content_block').each(function() {
        var level = $(this).data('level').toString();

        var levelIndex = level.lastIndexOf('-');

        var parentLevelNum = level.slice(0, levelIndex); //上一节点的层级

        if (parentLevelNum == levelNum) { //如果此节点的上一节点是被点击节点

            if (displayStatus) { //如果当前面板为折叠状态

                $(this).hide(); //让当前节点隐藏

                dot.data('pannl', false); //父级节点的pannl属性更改为false

                $('#svg').find(`polyline[id=${parentLevelNum}_${level}]`).hide(); //隐藏当前节点与父节点的连线
            } else {
                $(this).show(); //让当前节点显示

                dot.data('pannl', true); //父级节点的pannl属性更改为true

                $('#svg').find(`polyline[id=${parentLevelNum}_${level}]`).show(); //显示当前节点与父节点的连线
            }
        }
    })
}

/**
 * 面板折叠
 * blockObj jq对象
 */
function pannlFold(blockObj) {
    if (blockObj.find('.dot').length != 0) {
        blockObj.find('.dot').bind('click', function(e) {
            var levelNum = blockObj.data('level').toString();

            if (levelNum.indexOf('-') == -1) { //当前节点是根节点
                rootPannlJudge(blockObj, $(this));
            } else {
                childPannlJudge($(this), levelNum);
            }
        })
    }
}

$(document).ready(function() {
    $('.content_block').each(function() {
        // 给当前节点绑定移动事件
        dotMouseDown($(this));
        dotMouseUp($(this));

        // 面板折叠
        pannlFold($(this));

        // 开始绘线
        drawLineEntrance($(this), true);
    })
})