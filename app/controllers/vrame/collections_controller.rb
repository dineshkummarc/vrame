class Vrame::CollectionsController < Vrame::VrameController
  
  def index
    per_page = params[:per_page] || 50
    @collections = Collection.paginate :page => params[:page], :per_page => per_page
  end
  
  def show
    @collection = Collection.find(params[:id])
    if @collection.collectionable
      redirect_to [:edit, :vrame, @collection.collectionable]
    else
      flash[:error] = 'Zugehörigkeit der Collection nicht gefunden'
      redirect_to :back
    end
  end
  
  def rearrange
    @collection = Collection.find(params[:id])
  end
  
  def sort
    @collection = Collection.find(params[:id])
    
    params[:asset].each_with_index do |id, i|
      asset = Asset.find_by_id(id, @collection.id)
      
      # sanity check
      if asset.assetable_id == @collection.id 
        asset.position = i
        asset.save
      end
    end
    
    render :text => 'ok'
  end

  def destroy
    @collection = Collection.find(params[:id])
    if @collection and @collection.destroy
      flash[:success] = 'Collection gelöscht'
    else
      flash[:error] = 'Fehler beim Löschen der Collection'
    end
    redirect_to :root
  end
  
  private
    def single_access_allowed?
      action_name == 'create'
    end
end