require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Category, :type => :model do
  before(:all) do
    @title              = "JsonObjectTesting"
    @without_meta_title = "JsonObjectTestingWithoutTitle"
    
    @store_hash_with_schema = {
      "schema" => {
        "fields" => [
          { "uid" => "1", "name" => "some_string",      "type" => "String"     },
          { "uid" => "2", "name" => "some_text",        "type" => "Text"       },
          {               "name" => "some_file",        "type" => "File"       },
          {               "name" => "some_collection",  "type" => "Collection" },
          { "uid" => "3", "name" => "another_text",     "type" => "Text"       },
          {               "name" => "yet_another_text", "type" => "Text"       },
          {               "name" => "another_file",     "type" => "File"       },
          {               "name" => "some_datetime",    "type" => "Datetime"   }
        ]
      },
      
      "values" => {
        "1" => "Hello, I'm a value for a field called some_string!",
        "2" => "Hello, I'm a value for a field called some_text!",
        "3" => "Hello, I'm a value for a field called another_text!"
      }
    }.freeze
  end
  
  before(:each) do
    @category              = Category.new(:title => @title, :meta => @store_hash_with_schema)
    @category_without_meta = Category.new(:title => @without_meta_title)
  end
  
  it "should satisfy meta attribute object identity" do
    @category.meta.should              equal(@category.meta)
    @category_without_meta.meta.should equal(@category_without_meta.meta)
  end
  
  it "should serialize the meta object via JSON" do
    @category.save
    
    saved_meta_json = Category.find_by_title(@title).meta.to_json
    fixed_meta_json = @store_hash_with_schema.to_json
    
    saved_meta_json.should == fixed_meta_json
  end

  it "should have a meta attribute with readable attribtues" do
    @category.meta.some_string.should  == "Hello, I'm a value for a field called some_string!"
    @category.meta.some_text.should    == "Hello, I'm a value for a field called some_text!"
    @category.meta.another_text.should == "Hello, I'm a value for a field called another_text!"
  end
  
  it "should have a meta attribute with accessible attributes" do
    @category.meta.some_string      = "Modified value for some_string"
    @category.meta.another_text     = "Modified value for another_text"
    @category.meta.yet_another_text = "Modified value for yet_another_text"
    @category.meta.some_text        = "Modified value for some_text"
    
    @category.meta.some_string.should      == "Modified value for some_string"
    @category.meta.another_text.should     == "Modified value for another_text"
    @category.meta.yet_another_text.should == "Modified value for yet_another_text"
    @category.meta.some_text.should        == "Modified value for some_text"
  end
  
  it "should save a modified meta attribute correctly" do
    @category.meta.some_string      = "Modified value for some_string"
    @category.meta.another_text     = "Modified value for another_text"
    @category.meta.yet_another_text = "Modified value for yet_another_text"
    @category.meta.some_text        = "Modified value for some_text"
    
    @category.save
    
    @category = Category.find_by_title(@title)
    
    @category.meta.some_string.should      == "Modified value for some_string"
    @category.meta.another_text.should     == "Modified value for another_text"
    @category.meta.yet_another_text.should == "Modified value for yet_another_text"
    @category.meta.some_text.should        == "Modified value for some_text"
  end
  
  it "should have a meta attribute which raises an error when trying to access an unknown attribute" do
    lambda {
      @category.meta.unknown_schema_attribute
    }.should raise_error(JsonObject::UnknownSchemaAttributeError)    
    
    lambda {
      @category.meta.unknown_schema_attribute = "I don't have a place in this world"
    }.should raise_error(JsonObject::UnknownSchemaAttributeError)
  end
  
  it "should have a meta attribute which maps typed values to objects with specific classes" do
    @category.meta.some_file.should be_an(Asset)
    @category.meta.some_collection.should be_a(Collection)
  end
  
  it "should have a meta attribute which maps an asset correctly" do
    @category.save
    
    @asset = @category.assets.create()
    
    @category.meta.another_file = @asset
    
    @category.save
    
    @category = Category.find_by_title(@title)
    
    @category.meta.another_file.should == @asset
  end
  
  # it "should have a meta attributes which maps a datetime value correctly" do
  #   @now = DateTime.now
  #   
  #   @category.meta.some_datetime = @now
  #       
  #   @category.save
  #   
  #   @category = Category.find_by_title(@title)
  #   
  #   pp @category.meta.some_datetime
  # end
  
end
