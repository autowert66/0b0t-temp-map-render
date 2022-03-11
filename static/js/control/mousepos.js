MousePosControl.prototype=new BaseControl("MousePosControl");function MousePosControl(){}MousePosControl.prototype.create=function(n){const t=document.createElement("span");t.id="mouse-move-div";const o=e=>{const u=this.ui.latLngToMC(e.latlng,64),[s,a,l]=u;t.innerHTML=`<div class="btn-group" role="group">
      <button type="button" class="btn btn-default">
        X: ${Math.round(s)}
      </button>
      <button type="button" class="btn btn-default">
        Z: ${Math.round(a)}
      </button>
      <button type="button" class="btn btn-default">
        Y: ${Math.round(l)}
      </button>
    </div>`};this.ui.lmap.on("mousemove",o),this.ui.lmap.on("mousedown",o),n.appendChild(t)},MousePosControl.prototype.getName=function(){return"mouse-pos"};
