class Image < Asset
  belongs_to :collection
  
  has_attached_file :file,
    :path => ":rails_root/public/system/assets/:class/:id/:style.:extension",
    :url  =>                   "/system/assets/:class/:id/:style.:extension",
    :styles => {
      :thumbnail          => "100x140",
      :thumbnail_square   => "100x100#",
      :full               => "300x250"
    }
    
end