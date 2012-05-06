<?php
//		this class is responsible for pagination
//		takes the number of elements and builds the pagination tree
class Pagination {
    private $_regitry;
	private $firstPage = array();
	private $lastPage = array();
	private $elementsOnPage = array();
	private $currentPage = 0;
	private $pages = 0;
	private $elements = 0;
	private $elementsPerPage = 5;	//how many elements per page
	private $maxPageShow = 5;	//how many pages to show in links
	//		text for links
	private $firstText = "First";
	private $lastText = "Last";
	private $prevText = "<";
	private $nextText = ">";
	private $moreLinksText = "...";
	
	public function Pagination(&$registry,$post_per_page,$page) {
	//		class constructor
		$this->_registry = $registry;
        $this->setElementsPerPage($post_per_page);
        $this->setCurrentPage($page);
        $this->setUrl();

	}
	public function setElements($elements) {
	//		set the elements.pages.elements per page.first page and last page
		$this->elements = $elements;
		//		find out how many pages
		$this->pages = floor(($elements - 1) / $this->elementsPerPage) + 1;
		for ($i = 1;$i <= $this->pages;$i++) {
			$first = ($this->elementsPerPage * ($i - 1)) + 1;
			//		if last page then set last to total elements
			if ($i == $this->pages) {
				$last = $this->elements;
			}else {
				$last = $first + ($this->elementsPerPage - 1);
			}
			//		set elements per page
			$this->elementsOnPage[$i]['first'] = $first;
			$this->elementsOnPage[$i]['last'] = $last;
			//		set first and last
			if ($i == 1) {
				$this->firstPage['first'] = $first;
				$this->firstPage['last'] = $last;
				$this->firstPage['page'] = $i;
			}
			if ($i == $this->pages) {
				$this->lastPage['first'] = $first;
				$this->lastPage['last'] = $last;
				$this->lastPage['page'] = $i;
			}
		}
	}
	public function printElementsOnPage() {
	//		print contents of elements per page and first and last
	//		test purposes
		echo "First Page: ".$this->firstPage['first']." to ".$this->firstPage['last']."<br />";
		echo "Last Page: ".$this->lastPage['first']." to ".$this->lastPage['last']."<br />";
		echo "Current Page: ". $this->currentPage."<br /><br />";
		foreach($this->elementsOnPage as $key => $page) {
			echo "Page ".$key.": ".$page['first']." to ".$page['last']."<br />";
		}
	}
	public function printPageLinks() {

        $ret = '';
		if($this->pages > 1) {
		//		if there are more than 1 page then display page links
			//		print div for links
			$ret .= "<div class='pagination'>";
			//		print links for first and prev if needed
			if($this->currentPage != 1) {
			//		this is not first page
				$ret .= "<span controller='CreasetophLink' link='".$this->url."/page/1'>".$this->firstText."</span><span controller='CreasetophLink' link='".$this->url."/page/".($this->currentPage - 1) ."'>".$this->prevText."</span>";
			}
			//		calculate first and last link
			if($this->pages < $this->maxPageShow) {
			//		if pages is less than max pages to show then set first and last link respectivly
				$firstLink = 1;
				$lastLink = $this->pages;
			}else {
			//		if there are more pages than max pages to show then calculate links
				$firstLink = $this->currentPage;
				$lastLink = $firstLink + ($this->maxPageShow - 1);
				if($lastLink > $this->pages) {
					$lastLink = $this->pages;
					$firstLink = $this->pages - ($this->maxPageShow - 1);
				}
			}
			//		print sign of more links previous
			if($firstLink > 1) {
				$ret .= "<span>".$this->moreLinksText."</span>";
			}
			//		print links for pages
			for($i = $firstLink;$i <= $lastLink;$i++) {
				if($this->currentPage == $i) {
					$ret .= "<span>".$i."</span>";
				}else {
					$ret .= "<span controller='CreasetophLink' link='".$this->url."/page/".$i."'>".$i."</span>";
				}
			}
			//		print text for more links next
			if($lastLink < $this->pages) {
				$ret .= "<span>".$this->moreLinksText."</span>";
			}
			//		print links for last and next if needed
			if($this->currentPage != $this->pages) {
			//		this is not last page
				$ret .= "<span controller='CreasetophLink' link='".$this->url."/page/".($this->currentPage + 1) ."'>".$this->nextText."</span><span controller='CreasetophLink' link='".$this->url."/page/".$this->lastPage['page']."'>".$this->lastText."</span>";
			}
			$ret .= "</div>";
		}
        return $ret;
	}

    public function getPageLinks($elements) {
        $this->setElements($elements);
        return $this->printPageLinks();
    }
	public function getPageBounds() {
	//		get the first and last element for passed page
        $pageBounds['first'] = (($this->currentPage - 1) * $this->elementsPerPage) + 1;
		$pageBounds['elements'] = $this->elementsPerPage;
		return $pageBounds;
	}
	public function setCurrentPage($currentPage) {
	//		set current page. if passed current page is out of bounds then set to 1
		if($currentPage > 0 ) {
			$this->currentPage = $currentPage;
		}else {
			$this->currentPage = 1;
		}
	}
	public function setElementsPerPage($elementsPerPage) {
		if($elementsPerPage == ''){
			$this->elementsPerPage = 10;
		}else {
			$this->elementsPerPage = $elementsPerPage;
		}
	}
    public function setUrl() {
        $this->url = '';
        $params = $this->_registry->request;
        unset($params['page']);
        foreach($params as $key => $value) {
            if($key != 'ajax') {
                $tmp[] = $key;
                $tmp[] = $value;
            }
        }
        if(empty($tmp)) {
            $tmp = array();
        }
        $this->url = implode('/',
            array(
                $this->_registry->controller,
                $this->_registry->action
            )
        );
        if(!empty($tmp)) {
            $this->url .= '/' . implode('/',$tmp);
        }

    }
}
?>