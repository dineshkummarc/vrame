require 'paperclip_images'

class Asset < ActiveRecord::Base  
  belongs_to :user
  belongs_to :document
  belongs_to :collection
  
  has_attached_file :file,
    :url  => "/system/assets/:class/:id/:style.:extension",
    :path => ":rails_root/public/system/assets/:class/:id/:style.:extension"
  
  def serialize
    file.url
  end
end