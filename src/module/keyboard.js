KityMinder.registerModule( "KeyboardModule", function () {

    function buildPositionNetwork( root ) {
        var pointIndexes = [],
            p;
        root.traverse( function ( node ) {
            p = node.getData( 'point' );
            pointIndexes.push( {
                x: p.x,
                y: p.y,
                node: node
            } );
        } );
        for ( var i = 0; i < pointIndexes.length; i++ ) {
            findClosestPointsFor( pointIndexes, i );
        }
    }

    function quadOf( p ) {
        return p.x > 0 ?
            ( p.y > 0 ? 1 : 2 ) :
            ( p.y < 0 ? 3 : 4 );
    }

    function findClosestPointsFor( pointIndexes, iFind ) {
        var find = pointIndexes[ iFind ];
        var matrix = new kity.Matrix().translate( -find.x, -find.y ).rotate( 45 );
        var most = {}, quad;
        var current;

        for ( var i = 0; i < pointIndexes.length; i++ ) {
            if ( i == iFind ) continue;
            current = matrix.transformPoint( pointIndexes[ i ].x, pointIndexes[ i ].y );
            quad = quadOf( current );
            if ( !most[ quad ] || current.length() < most[ quad ].point.length() ) {
                most[ quad ] = {
                    point: current,
                    node: pointIndexes[ i ].node
                };
            }
        }
        find.node._nearestNodes = {
            right: most[ 1 ] && most[ 1 ].node || null,
            top: most[ 2 ] && most[ 2 ].node || null,
            left: most[ 3 ] && most[ 3 ].node || null,
            down: most[ 4 ] && most[ 4 ].node || null
        };
    }


    function navigateTo( km, direction ) {
        var referNode = km.getSelectedNode();
        if ( !referNode ) {
            km.select( km.getRoot() );
            buildPositionNetwork( km.getRoot() );
            return;
        }
        var nextNode = referNode._nearestNodes[ direction ];
        if ( nextNode ) {
            km.select( nextNode, true );
        }
    }
    return {

        "events": {
            contentchange: function () {
                buildPositionNetwork( this.getRoot() );
            },
            "normal.keydown": function ( e ) {

                var keys = KityMinder.keymap;

                var node = e.getTargetNode();
                this.receiver.keydownNode = node;
                switch ( e.originEvent.keyCode ) {
                case keys.Enter:
                    this.execCommand( 'appendSiblingNode', new MinderNode( this.getLang().topic ) );
                    e.preventDefault();
                    break;
                case keys.Tab:
                    this.execCommand( 'appendChildNode', new MinderNode( this.getLang().topic ) );
                    e.preventDefault();
                    break;
                case keys.Backspace:
                case keys.Del:
                    this.execCommand( 'removenode' );
                    e.preventDefault();
                    break;

                case keys.Left:
                    navigateTo( this, 'left' );
                    e.preventDefault();
                    break;
                case keys.Up:
                    navigateTo( this, 'top' );
                    e.preventDefault();
                    break;
                case keys.Right:
                    navigateTo( this, 'right' );
                    e.preventDefault();
                    break;
                case keys.Down:
                    navigateTo( this, 'down' );
                    e.preventDefault();
                    break;
                }

            }
        }
    };
} );