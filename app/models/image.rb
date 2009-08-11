class Image < Asset
  belongs_to :collection
  
  has_attached_file :file,
    :url  => "/assets/:class/:id/:style.:extension",
    :path => ":rails_root/public/assets/:class/:id/:style.:extension",
    :styles => {
      :thumbnail          => "100x140",
      :thumbnail_square   => "100x100#",
      :full               => "300x250"
    }
end