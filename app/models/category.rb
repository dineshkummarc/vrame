class Category < ActiveRecord::Base
  has_many :documents, :order => :position
  
  has_friendly_id :title, :use_slug => true, :strip_diacritics => true
  
  belongs_to :user
  
  acts_as_tree :order => "position", :counter_cache => true
  acts_as_list :scope => :parent
  
  validates_presence_of :title
  
  named_scope :order_before, lambda {|position| { :conditions => ["position < ?", position], :limit => 1, :order => "position DESC" }}
  named_scope :order_after, lambda {|position| { :conditions => ["position > ?", position], :limit => 1, :order => "position ASC" }}
  named_scope :with_parent, lambda {|parent|
    if parent.parent_id != nil 
      {:conditions => ["parent_id = ?", parent.parent_id ]}
    else
      {:conditions => ["parent_id IS NULL"]}
    end
  }
  named_scope :short_navigation, :conditions => { :short_navigation => 1 }
  named_scope :published, :conditions => '`categories`.`published` = 1'
  
  has_json_object :schema,
    :default => [],
    :before_serialize => lambda { |v|
      v.map { |i|
        # Create new UID if nonexistent
        # @TODO move to a static model function (will be part of JsonSchema)
        # @TODO find a better unique hash algo  (will be an auto incrementing primary key ---> JsonSchema will handle this)
        i.merge({'uid' => i['uid'].nil? || i['uid'].empty? ? rand(36**32).to_s(36) : i['uid']})
      } unless v.nil?
    }
  
  has_json_object :meta
  
  Public_attributes = %w(id title url meta_keywords meta_description meta_title parent_id language_id updated_at created_at)
  
  def available_parent_categories
    if new_record?
      Category.all
    else
      Category.find(:all, :conditions => ['id != ?', id])
    end
  end
  
  def backend_url_path
    '/vrame/' + backend_url
  end
  
  def to_public_hash
    # Convert category to hash
    category_hash = attributes.reject { |key, _| !Public_attributes.include?(key) }
    
    if category_hash['url'] == ""
      category_hash['url'] = to_param
    end
    
    category_hash
  end
  
  def insignificant?
    documents.empty? and url.empty? and template.empty?
  end
  
  def first_significant_child
    children.find(
      :first,
      :order => :position,
      :conditions => '`documents_count` > 0 AND `url` IS NOT NULL and `template` IS NOT NULL'
    )
  end
  
end